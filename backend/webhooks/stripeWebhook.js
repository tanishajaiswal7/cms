const stripeConfig = require("../config/stripe");
const Rent = require("../models/Rent");
const Payment = require("../models/Payment");

/**
 * Handle Stripe webhook events
 * @param {object} event - Stripe webhook event
 */
const handleWebhookEvent = async (event) => {
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;

      case "charge.dispute.created":
        await handleChargeDispute(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    throw error;
  }
};

/**
 * Handle successful payment
 * @param {object} paymentIntent - Stripe payment intent object
 */
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const { id: paymentIntentId, metadata, charges, receipt_email } =
      paymentIntent;
    const { rentId, residentId } = metadata;

    console.log(`Processing successful payment: ${paymentIntentId}`);

    // Find or create payment record
    let payment = await Payment.findByPaymentIntentId(paymentIntentId);

    if (payment) {
      // Update existing payment
      await payment.markAsSucceeded(
        charges.data[0].id
      );
    } else {
      // Create new payment record
      payment = await Payment.create({
        paymentIntentId,
        chargeId: charges.data[0].id,
        residentId,
        rentId: rentId || null,
        amount: stripeConfig.getAmountInRupees(paymentIntent.amount),
        currency: paymentIntent.currency,
        status: "succeeded",
        paymentMethodId: paymentIntent.payment_method,
        paymentMethodType: paymentIntent.payment_method_types[0],
        description: paymentIntent.description,
        metadata: Object.fromEntries(Object.entries(metadata)),
        paidAt: new Date(),
        receiptUrl: charges.data[0].receipt_url,
        webhookProcessed: true,
      });
    }

    // If this is a rent payment, update rent status
    if (rentId) {
      const rent = await Rent.findById(rentId);
      if (rent) {
        rent.status = "paid";
        rent.paymentIntentId = paymentIntentId;
        rent.paidAmount = Number(rent.totalAmount || 0);
        rent.paidAt = new Date();
        rent.paidDate = new Date();
        await rent.save();
        console.log(`Rent ${rentId} marked as paid`);
      }
    }

    console.log(`Payment ${paymentIntentId} processed successfully`);
  } catch (error) {
    console.error("Error handling payment_intent.succeeded:", error);
    throw error;
  }
};

/**
 * Handle failed payment
 * @param {object} paymentIntent - Stripe payment intent object
 */
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const { id: paymentIntentId, last_payment_error, metadata } =
      paymentIntent;
    const { rentId, residentId } = metadata;

    console.log(`Processing failed payment: ${paymentIntentId}`);

    // Find or create payment record
    let payment = await Payment.findByPaymentIntentId(paymentIntentId);

    const failureReason =
      last_payment_error?.message || "Payment failed with unknown reason";

    if (payment) {
      // Update existing payment
      await payment.markAsFailed(failureReason);
    } else {
      // Create new payment record
      await Payment.create({
        paymentIntentId,
        residentId,
        rentId: rentId || null,
        amount: stripeConfig.getAmountInRupees(paymentIntent.amount),
        currency: paymentIntent.currency,
        status: "failed",
        failureReason,
        metadata: Object.fromEntries(Object.entries(metadata)),
      });
    }

    console.log(`Payment ${paymentIntentId} marked as failed: ${failureReason}`);
  } catch (error) {
    console.error("Error handling payment_intent.payment_failed:", error);
    throw error;
  }
};

/**
 * Handle charge refunded
 * @param {object} charge - Stripe charge object
 */
const handleChargeRefunded = async (charge) => {
  try {
    const chargeId = charge.id;
    const refundAmount = stripeConfig.getAmountInRupees(charge.amount_refunded);
    const { rentId, residentId } = charge.metadata;

    console.log(`Processing refund for charge: ${chargeId}`);

    // Find payment by charge ID
    let payment = await Payment.findOne({ chargeId });

    if (payment) {
      // Get refund details
      const refunds = await stripeConfig.client.refunds.list({ charge: chargeId });
      const refund = refunds.data[0];

      if (refund) {
        await payment.markAsRefunded(
          refund.id,
          stripeConfig.getAmountInRupees(refund.amount),
          refund.reason || "Customer requested"
        );
        console.log(`Payment ${payment.paymentIntentId} refunded`);

        // If this was a rent payment, reset rent status
        if (rentId) {
          const rent = await Rent.findById(rentId);
          if (rent) {
            rent.status = "unpaid";
            rent.paymentIntentId = null;
            rent.paidAmount = 0;
            rent.paidAt = null;
            rent.paidDate = null;
            await rent.save();
            console.log(`Rent ${rentId} status reset to unpaid due to refund`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error handling charge.refunded:", error);
    throw error;
  }
};

/**
 * Handle charge dispute
 * @param {object} dispute - Stripe dispute object
 */
const handleChargeDispute = async (dispute) => {
  try {
    console.log(`Dispute created for charge ${dispute.charge}:`, dispute);
    // Log the dispute for admin review
    // You can implement email notification or admin dashboard alerts here
  } catch (error) {
    console.error("Error handling charge.dispute.created:", error);
    throw error;
  }
};

/**
 * Process webhook request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const processWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripeConfig.constructWebhookEvent(req.body, sig);
    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    if (error instanceof Error && error.type === "StripeSignatureVerificationError") {
      console.error("Webhook signature verification failed:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.error("Webhook processing error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

module.exports = {
  handleWebhookEvent,
  handlePaymentSucceeded,
  handlePaymentFailed,
  handleChargeRefunded,
  handleChargeDispute,
  processWebhook,
};
