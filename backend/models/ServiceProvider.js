const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Electrician", "Plumber", "Maintenance"],
      required: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Phone number must be a valid 10-digit Indian mobile number"],
      trim: true,
    },
     active:{
        type:Boolean,
        default:true,
     },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);
