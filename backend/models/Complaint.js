const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

category: {
  type: String,
  enum: ["Electricity", "Water", "Maintenance", "Other"],
  required: true,
},


    otherCategoryReason: {
      type: String,
      required: function () {
        return this.category === "Other";
      },
    },

    societyName: {
      type: String,
      required: true,
    },

    block: {
      type: String,
    },

    roomNumber: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
      resolvedAt: {
  type: Date,
  default: null,
},

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    adminMessage: {
  type: String,
  default: "",
},



adminName: {
  type: String,
},

assignedProvider: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "ServiceProvider",
  default:null,
},



    image: [{
      type:String,//file path
    },]


  },




  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);
