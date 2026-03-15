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

const { protect } = require("../middlewares/authMiddleware");

// CREATE RENT
router.post("/", protect, createRent);

// GET ALL RENTS
router.get("/", protect, getAllRents);

// GET RENT BY RESIDENT
router.get("/resident/:residentId", protect, getRentByResident);

// CURRENT MONTH
router.get("/current-month", protect, getCurrentMonthRent);

// UPDATE RENT
router.put("/:id", protect, updateRent);

// UPDATE STATUS
router.patch("/:id/status", protect, updateRentStatus);

// DELETE
router.delete("/:id", protect, deleteRent);

// STATISTICS
router.get("/stats", protect, getRentStatistics);

module.exports = router;