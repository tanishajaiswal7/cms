const express = require("express");
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentDetails,
  requestRefund,
} = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * Payment Routes
 * Base URL: /api/payments
 */

// Protected routes (require authentication)

// Create payment intent for rent payment
router.post("/create-intent", protect, createPaymentIntent);

// Confirm payment and update rent status
router.post("/confirm", protect, confirmPayment);

// Get payment history for authenticated user
router.get("/history", protect, getPaymentHistory);

// Get payment details
router.get("/:paymentId", protect, getPaymentDetails);

// Request refund for a payment
router.post("/:paymentId/refund", protect, requestRefund);

module.exports = router;
