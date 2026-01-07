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

module.exports = { authLimiter, complaintLimiter };
