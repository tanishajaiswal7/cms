const mongoose = require("mongoose");

const residentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    buildingName: {
      type: String,
      trim: true,
      maxlength: [100, "Building name too long"],
      default: "",
    },
    roomNo: {
      type: String,
      trim: true,
      maxlength: [20, "Room number too long"],
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, "Notes too long"],
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

residentSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model("Resident", residentSchema);