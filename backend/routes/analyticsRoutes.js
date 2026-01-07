const express = require("express");
const router = express.Router();

console.log("✅ analyticsRoutes file loaded");

const {
  getComplaintSummary,
  getCategoryDistribution,
  getComplaintTrends,
  getAverageResolutionTime,
  getPendingAlerts,
} = require("../controllers/analyticsController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");

router.get("/summary", protect, adminOnly, getComplaintSummary);
router.get("/categories", protect, adminOnly, getCategoryDistribution);
router.get("/trends", protect, adminOnly, getComplaintTrends);
router.get(
  "/pending-alerts",
  protect,
  adminOnly,
  getPendingAlerts
);


router.get(
  "/average-resolution-time",
  protect,
  adminOnly,
  getAverageResolutionTime
);


module.exports = router;
