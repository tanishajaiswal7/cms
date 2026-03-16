const express = require("express");
const router = express.Router();

const {
  createRent,
  getAllRents,
  getRentByResident,
  getCurrentMonthRent,
  updateRent,
  updateRentStatus,
  deleteRent,
  getRentStatistics,
} = require("../controllers/rentController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { apiLimiter } = require("../middlewares/rateLimiter");

// CREATE RENT (admin only)
router.post("/", protect, adminOnly, apiLimiter, createRent);

// GET ALL RENTS (admin only)
router.get("/", protect, adminOnly, apiLimiter, getAllRents);

// GET RENT BY RESIDENT
router.get("/resident/:residentId", protect, apiLimiter, getRentByResident);

// CURRENT MONTH (user can check their own)
router.get("/current-month", protect, apiLimiter, getCurrentMonthRent);

// UPDATE RENT (admin only)
router.put("/:id", protect, adminOnly, apiLimiter, updateRent);

// UPDATE STATUS (admin only)
router.patch("/:id/status", protect, adminOnly, apiLimiter, updateRentStatus);

// DELETE (admin only)
router.delete("/:id", protect, adminOnly, apiLimiter, deleteRent);

// STATISTICS (admin only)
router.get("/stats", protect, adminOnly, apiLimiter, getRentStatistics);

module.exports = router;