const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const complaintRoutes = require("./routes/complaintRoutes");
const authRoutes = require("./routes/authRoutes");
const serviceProviderRoutes = require("./routes/serviceProviderRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const userRoutes = require("./routes/userRoutes");
const residentRoutes = require("./routes/residentRoutes");
const rentRoutes = require("./routes/rentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminPaymentRoutes = require("./routes/adminPaymentRoutes");
const { handleStripeWebhook } = require("./controllers/paymentController");

const errorHandler = require("./middlewares/errorHandler");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const app = express();
app.set("trust proxy", 1);
connectDB();
const PORT = Number(process.env.PORT) || 5000;

// ======================
// ENVIRONMENT VALIDATION
// ======================
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "REFRESH_SECRET"];
const missingEnvVars = requiredEnvVars.filter((env) => !process.env[env]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

// ======================
// MIDDLEWARES
// ======================
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());

// CORS Configuration - use environment variables in production
const envAllowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Fallback to localhost for development only
const defaultAllowedOrigins = process.env.NODE_ENV === "production" ? [] : [
  "http://localhost:3000",
  "http://localhost:5173",
];

const allowedOrigins = envAllowedOrigins.length
  ? envAllowedOrigins
  : defaultAllowedOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Morgan logging - use combined format in production
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ======================
// ROUTES
// ======================
app.get("/", (req, res) => {
  res.send("Server is running tanisha");
});

app.get("/api/health/stripe", (req, res) => {
  const secretKey =
    typeof process.env.STRIPE_SECRET_KEY === "string"
      ? process.env.STRIPE_SECRET_KEY.trim()
      : "";
  const publishableKey =
    typeof process.env.STRIPE_PUBLISHABLE_KEY === "string"
      ? process.env.STRIPE_PUBLISHABLE_KEY.trim()
      : "";

  const isSecretValid = /^sk_(test|live)_/.test(secretKey);
  const isPublishableValid = /^pk_(test|live)_/.test(publishableKey);

  const mode = isSecretValid
    ? secretKey.startsWith("sk_live_")
      ? "live"
      : "test"
    : null;

  const warnings = [];

  if (!isSecretValid) {
    warnings.push("Invalid or missing STRIPE_SECRET_KEY");
  }

  if (!isPublishableValid) {
    warnings.push("Invalid or missing STRIPE_PUBLISHABLE_KEY");
  }

  return res.status(200).json({
    success: true,
    data: {
      stripeConfigured: isSecretValid && isPublishableValid,
      mode,
      warnings,
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/providers", serviceProviderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/rents", rentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);

// ERROR HANDLER (⚠️ ALWAYS LAST)

app.use(errorHandler);

app.listen(PORT, () => {
  // Server listening
});
