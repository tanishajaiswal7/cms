const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { profileLimiter } = require("../middlewares/rateLimiter");
const { updateProfile, getProfile, getAllResidents } = require("../controllers/userController");

// Get all residents (for dropdowns in admin forms)
router.get("/residents", protect, getAllResidents);

router.get("/me", protect, getProfile);
router.put("/me", protect, profileLimiter, updateProfile);

module.exports = router;
