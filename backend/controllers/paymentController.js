const stripeConfig = require("../config/stripe");
const Rent = require("../models/Rent");
const Payment = require("../models/Payment");
const { processWebhook } = require("../webhooks/stripeWebhook");

/**
 * Create a payment intent for rent payment
 * POST /api/payments/create-intent
 */
const createPaymentIntent = async (req, res) => {
  try {
    const { rentId, amount } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;

    // Validate input
    if (!rentId) {
      return res.status(400).json({
        success: false,
        message: "Rent ID is required",
      });
    }

    // Verify rent exists and get details
    const rent = await Rent.findById(rentId);
    if (!rent) {
      return res.status(404).json({
        success: false,
        message: "Rent record not found",
      });
    }

    // Verify authenticated user is the resident
    if (rent.residentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to pay this rent",
      });
    }

    // Check if rent is already paid
    if (rent.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "This rent has already been paid",
      });
    }

    const dueAmount = Number(rent.totalAmount || 0) - Number(rent.paidAmount || 0);
    if (dueAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "No due amount left for this rent",
      });
    }

    const requestedAmount = amount !== undefined ? Number(amount) : dueAmount;
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid number greater than 0",
      });
    }

    if (Math.abs(requestedAmount - dueAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Payment amount must match due amount: ₹${dueAmount.toFixed(2)}`,
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripeConfig.createPaymentIntent({
      amount: dueAmount,
      metadata: {
        rentId: rentId.toString(),
        residentId: userId.toString(),
        month: rent.month,
      },
      description: `Rent payment for ${rent.month}`,
      receiptEmail: userEmail,
    });

    // Create payment record
    const payment = await Payment.create({
      paymentIntentId: paymentIntent.id,
      residentId: userId,
      rentId,
      amount: dueAmount,
      currency: paymentIntent.currency,
      status: "pending",
      description: `Rent payment for ${rent.month}`,
      metadata: {
        month: rent.month,
        propertyId: rent.propertyId?.toString() || "N/A",
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Payment intent created successfully",
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: payment._id,
        amount: dueAmount,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      },
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment intent",
    });
  }
};

/**
 * Confirm payment and update rent status
 * POST /api/payments/confirm
 */
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, rentId } = req.body;
    const userId = req.user._id;

    if (!paymentIntentId || !rentId) {
      return res.status(400).json({
        success: false,
        message: "Payment Intent ID and Rent ID are required",
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripeConfig.retrievePaymentIntent(
      paymentIntentId
    );

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: `Payment status: ${paymentIntent.status}`,
      });
    }

    // Verify user authorization
    const rent = await Rent.findById(rentId);
    if (!rent || rent.residentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to confirm this payment",
      });
    }

    // Update or create payment record
    let payment = await Payment.findByPaymentIntentId(paymentIntentId);

    const chargeId = paymentIntent.latest_charge || paymentIntent.charges?.data?.[0]?.id || null;
    const paymentMethodType =
      Array.isArray(paymentIntent.payment_method_types) && paymentIntent.payment_method_types.length > 0
        ? paymentIntent.payment_method_types[0]
        : "card";

    if (payment) {
      await payment.markAsSucceeded(chargeId);
    } else {
      payment = await Payment.create({
        paymentIntentId: paymentIntent.id,
        chargeId,
        residentId: userId,
        rentId,
        amount: stripeConfig.getAmountInRupees(paymentIntent.amount),
        currency: paymentIntent.currency,
        status: "succeeded",
        paymentMethodId: paymentIntent.payment_method,
        paymentMethodType,
        paidAt: new Date(),
        webhookProcessed: true,
      });
    }

    // Update rent record status to paid
    const updatedRent = await Rent.findByIdAndUpdate(
      rentId,
      {
        status: "paid",
        paymentIntentId: paymentIntentId,
        paidAmount: Number(rent.totalAmount || 0),
        paidAt: new Date(),
        paidDate: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Payment confirmed and rent marked as paid",
      data: {
        rent: updatedRent,
        payment: payment,
      },
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm payment",
    });
  }
};

/**
 * Get payment history for authenticated user
 * GET /api/payments/history
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10, skip = 0 } = req.query;

    const query = { residentId: userId };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("rentId", "month rentAmount totalAmount");

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payment history",
    });
  }
};

/**
 * Get payment details
 * GET /api/payments/:paymentId
 */
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findById(paymentId).populate(
      "rentId",
      "month rentAmount totalAmount"
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify user authorization
    if (payment.residentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this payment",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payment details",
    });
  }
};

/**
 * Request refund for a payment
 * POST /api/payments/:paymentId/refund
 */
const requestRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify user authorization
    if (payment.residentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to refund this payment",
      });
    }

    if (payment.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Only succeeded payments can be refunded",
      });
    }

    if (payment.refundStatus !== "none") {
      return res.status(400).json({
        success: false,
        message: "This payment has already been refunded",
      });
    }

    try {
      // Create refund via Stripe
      const refund = await stripeConfig.client.refunds.create({
        charge: payment.chargeId,
        reason: reason || "requested_by_customer",
      });

      // Update payment record
      await payment.markAsRefunded(
        refund.id,
        stripeConfig.getAmountInRupees(refund.amount),
        reason || "Customer requested refund"
      );

      // Reset rent status if applicable
      if (payment.rentId) {
        await Rent.findByIdAndUpdate(
          payment.rentId,
          {
            status: "unpaid",
            paymentIntentId: null,
            paidAmount: 0,
            paidAt: null,
            paidDate: null,
          },
          { new: true }
        );
      }

      res.status(200).json({
        success: true,
        message: "Refund processed successfully",
        data: payment,
      });
    } catch (stripeError) {
      console.error("Stripe refund error:", stripeError);
      res.status(400).json({
        success: false,
        message: stripeError.message || "Failed to process refund",
      });
    }
  } catch (error) {
    console.error("Error requesting refund:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to request refund",
    });
  }
};

/**
 * Handle Stripe webhook
 * POST /api/payments/webhook
 */
const handleStripeWebhook = async (req, res) => {
  await processWebhook(req, res);
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentDetails,
  requestRefund,
  handleStripeWebhook,
};
