const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { updateProfile, getProfile } = require("../controllers/userController");

router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);




module.exports = router;
