const mongoose = require("mongoose");

const connectDB = async (retries = 5, delay = 1000) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
    // MongoDB connected successfully
  } catch (error) {
    if (retries <= 0) {
      // All retries exhausted
      process.exit(1);
    }
    // Retry after delay
    await new Promise(resolve => setTimeout(resolve, delay));
    connectDB(retries - 1, delay);
  }
};

module.exports = connectDB;
