const express=require("express");
const {registerUser,loginUser,logoutUser,refreshAccessToken,resetPassword,}=require("../controllers/authController");
const { authLimiter } = require("../middlewares/rateLimiter");

const router=express.Router();
router.post("/register",authLimiter,registerUser);
router.post("/login",authLimiter, loginUser);
router.post("/logout", logoutUser);
router.get("/refresh", refreshAccessToken);
router.post("/reset-password", resetPassword);

module.exports = router;
