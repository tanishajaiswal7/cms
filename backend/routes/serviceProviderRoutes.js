const express = require("express");
const router = express.Router();

const {
  createProvider,
  getProviders,
  deleteProvider,
  toggleProviderStatus
} = require("../controllers/serviceProviderController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");

router.post("/", protect, adminOnly, createProvider);
router.get("/", protect, adminOnly, getProviders);
router.delete("/:id", protect, adminOnly, deleteProvider);
router.put(
  "/:id/toggle",
  protect,
  adminOnly,
  toggleProviderStatus
);


module.exports = router;
