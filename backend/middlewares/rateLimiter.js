const rateLimit = require("express-rate-limit");

// limit for auth routes (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: "Too many attempts, please try again later",
});

// limit for complaint creation
const complaintLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  message: "Too many complaints submitted, slow down",
});

// limit for API routes (general)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: "Too many requests, please try again later",
});

// limit for payment routes
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 payment requests per IP
  message: "Too many payment attempts, please try again later",
});

// limit for user profile updates
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 requests per IP
  message: "Too many update attempts, please try again later",
});

module.exports = { authLimiter, complaintLimiter, apiLimiter, paymentLimiter, profileLimiter };
