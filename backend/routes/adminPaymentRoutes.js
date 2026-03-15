const express = require("express");
const {
  getAllPayments,
  getPaymentStats,
  getPaymentDetailsAdmin,
  exportPayments,
  getResidentPaymentHistory,
} = require("../controllers/adminPaymentController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * Admin Payment Routes
 * Base URL: /api/admin/payments
 * All routes require admin authentication
 */

// Get all payments with filters
router.get("/", protect, adminOnly, getAllPayments);

// Get payment statistics
router.get("/stats", protect, adminOnly, getPaymentStats);

// Get payment details
router.get("/:paymentId", protect, adminOnly, getPaymentDetailsAdmin);

// Export payments
router.get("/export/:format", protect, adminOnly, exportPayments);

// Get resident payment history
router.get("/resident/:residentId", protect, adminOnly, getResidentPaymentHistory);

module.exports = router;
