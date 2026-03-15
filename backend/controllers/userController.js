const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET PROFILE
const getProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone || "",
    address: req.user.address || "",
    role: req.user.role,
  });
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  const { phone, address } = req.body;

  const user = await User.findById(req.user._id);

  user.phone = phone;
  user.address = address;

  await user.save();

  res.json({
    message: "Profile updated successfully",
  });
};

// GET ALL RESIDENTS (for admin)
const getAllResidents = async (req, res) => {
  try {
    const residents = await User.find({ role: "resident" }).select(
      "_id name email phone address role"
    );
    res.status(200).json({
      success: true,
      message: "Residents fetched successfully",
      data: residents,
    });
  } catch (error) {
    console.error("Error fetching residents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch residents",
      error: error.message,
    });
  }
};

module.exports = { getProfile, updateProfile, getAllResidents };
