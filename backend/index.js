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

// ======================
// MIDDLEWARES
// ======================
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());
const allowedOrigins = [
  "http://localhost:3000",
  "https://cms-beta-one.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ======================
// ROUTES
// ======================
app.get("/", (req, res) => {
  res.send("Server is running tanisha");
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/providers", serviceProviderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rents", rentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);

// ERROR HANDLER (⚠️ ALWAYS LAST)

app.use(errorHandler);

app.listen(5000, () => {
  console.log("Hey, tanisha ! Your Server started on port 5000");
});
