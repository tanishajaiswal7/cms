const mongoose = require("mongoose");

const rentSchema = new mongoose.Schema(
  {
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Resident ID is required"],
    },

    month: {
      type: String,
      required: [true, "Month is required"],
    },

    rentAmount: {
      type: Number,
      required: [true, "Rent amount is required"],
      min: [0, "Rent amount cannot be negative"],
    },

    additionalCharges: {
      type: Number,
      default: 0,
      min: [0, "Additional charges cannot be negative"],
    },

    fine: {
      type: Number,
      default: 0,
      min: [0, "Fine cannot be negative"],
    },

    // ❗ FIXED HERE
    totalAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["unpaid", "paid", "partial"],
      default: "unpaid",
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    dueDate: {
      type: Date,
    },

    paidDate: {
      type: Date,
    },

    paymentIntentId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      maxlength: 500,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Automatically calculate total amount
 */
rentSchema.pre("save", function () {
  this.totalAmount =
    Number(this.rentAmount || 0) +
    Number(this.additionalCharges || 0) +
    Number(this.fine || 0);
});

rentSchema.index({ residentId: 1, month: 1 });

module.exports = mongoose.model("Rent", rentSchema);