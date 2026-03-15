const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { updateProfile, getProfile, getAllResidents } = require("../controllers/userController");

// Get all residents (for dropdowns in admin forms)
router.get("/residents", protect, getAllResidents);

router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);

module.exports = router;
