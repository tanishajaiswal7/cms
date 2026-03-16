const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Resident = require("../models/Resident");

// GET PROFILE
const getProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone || "",
    address: req.user.address || "",
    buildingName: req.user.buildingName || "",
    roomNo: req.user.roomNo || "",
    role: req.user.role,
  });
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  const { phone, address, buildingName, roomNo } = req.body;

  const user = await User.findById(req.user._id);

  user.phone = phone;
  user.address = address;
  if (buildingName !== undefined) user.buildingName = buildingName;
  if (roomNo !== undefined) user.roomNo = roomNo;

  await user.save();

  res.json({
    message: "Profile updated successfully",
  });
};

// GET ALL RESIDENTS (for admin)
const getAllResidents = async (req, res) => {
  try {
    const residents = await Resident.find({ isActive: true })
      .populate("userId", "_id name email phone address")
      .sort({ createdAt: -1 });

    const data = residents
      .filter((resident) => resident.userId)
      .map((resident) => ({
        _id: resident.userId._id,
        residentRecordId: resident._id,
        name: resident.userId.name,
        email: resident.userId.email,
        phone: resident.userId.phone || "",
        address: resident.userId.address || "",
        buildingName: resident.buildingName || "",
        roomNo: resident.roomNo || "",
        role: "resident",
      }));

    res.status(200).json({
      success: true,
      message: "Residents fetched successfully",
      data,
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
