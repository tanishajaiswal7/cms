const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET PROFILE
const getProfile = async (req, res) => {
  res.json({
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




   

module.exports = { getProfile, updateProfile};
