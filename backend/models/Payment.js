const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // Payment identification
    paymentIntentId: {
      type: String,
      required: [true, "Payment Intent ID is required"],
      unique: true,
      index: true,
    },

    chargeId: {
      type: String,
      sparse: true,
      index: true,
    },

    // User information
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Resident ID is required"],
      index: true,
    },

    // Rent information (if payment is for rent)
    rentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rent",
      sparse: true,
      index: true,
    },

    // Payment amount information
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    currency: {
      type: String,
      default: "inr",
      lowercase: true,
    },

    // Payment status
    status: {
      type: String,
      enum: {
        values: ["pending", "succeeded", "failed", "canceled", "refunded"],
        message:
          "Status must be pending, succeeded, failed, canceled, or refunded",
      },
      default: "pending",
      index: true,
    },

    // Refund information
    refundId: {
      type: String,
      sparse: true,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: [0, "Refund amount cannot be negative"],
    },

    refundStatus: {
      type: String,
      enum: {
        values: ["none", "partial", "full"],
        message: "Refund status must be none, partial, or full",
      },
      default: "none",
    },

    refundReason: {
      type: String,
      sparse: true,
    },

    // Payment method information
    paymentMethodId: {
      type: String,
      sparse: true,
    },

    paymentMethodType: {
      type: String,
      enum: {
        values: ["card", "netbanking", "wallet", "upi", "other"],
        message:
          "Payment method type must be card, netbanking, wallet, upi, or other",
      },
      default: "card",
    },

    last4Digits: {
      type: String,
      sparse: true,
    },

    // Description and metadata
    description: {
      type: String,
      sparse: true,
    },

    metadata: {
      type: Map,
      of: String,
      default: new Map(),
    },

    // Timestamps
    paidAt: {
      type: Date,
      sparse: true,
    },

    refundedAt: {
      type: Date,
      sparse: true,
    },

    failureReason: {
      type: String,
      sparse: true,
    },

    receiptUrl: {
      type: String,
      sparse: true,
    },

    // Tracking
    webhookProcessed: {
      type: Boolean,
      default: false,
    },

    ipAddress: {
      type: String,
      sparse: true,
    },

    notes: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
paymentSchema.index({ residentId: 1, status: 1 });
paymentSchema.index({ rentId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ paidAt: -1 });

// Virtual for checking if payment is completed
paymentSchema.virtual("isCompleted").get(function () {
  return this.status === "succeeded";
});

// Methods
paymentSchema.methods.markAsSucceeded = async function (chargeId) {
  this.status = "succeeded";
  this.chargeId = chargeId;
  this.paidAt = new Date();
  this.webhookProcessed = true;
  return await this.save();
};

paymentSchema.methods.markAsFailed = async function (reason) {
  this.status = "failed";
  this.failureReason = reason;
  return await this.save();
};

paymentSchema.methods.markAsRefunded = async function (refundId, amount, reason) {
  this.refundId = refundId;
  this.refundAmount = amount;
  this.status = "refunded";
  this.refundStatus = amount >= this.amount ? "full" : "partial";
  this.refundReason = reason;
  this.refundedAt = new Date();
  return await this.save();
};

// Static methods for common queries
paymentSchema.statics.findByPaymentIntentId = function (paymentIntentId) {
  return this.findOne({ paymentIntentId });
};

paymentSchema.statics.findByRentId = function (rentId) {
  return this.find({ rentId });
};

paymentSchema.statics.findPaidByResident = function (residentId) {
  return this.find({ residentId, status: "succeeded" });
};

paymentSchema.statics.findPendingByResident = function (residentId) {
  return this.find({ residentId, status: "pending" });
};

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
