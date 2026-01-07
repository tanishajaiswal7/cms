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
      required: true,
    },
     active:{
        type:Boolean,
        default:true,
     },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);
