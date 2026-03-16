const express = require("express");
const router = express.Router();

const {
  createProvider,
  getProviders,
  deleteProvider,
  toggleProviderStatus
} = require("../controllers/serviceProviderController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { apiLimiter } = require("../middlewares/rateLimiter");

router.post("/", protect, adminOnly, apiLimiter, createProvider);
router.get("/", protect, getProviders);
router.delete("/:id", protect, adminOnly, apiLimiter, deleteProvider);
router.put(
  "/:id/toggle",
  protect,
  adminOnly,
  apiLimiter,
  toggleProviderStatus
);


module.exports = router;
