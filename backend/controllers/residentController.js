const Resident = require("../models/Resident");
const User = require("../models/User");

const ensureAdmin = (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access only" });
    return false;
  }
  return true;
};

const listResidents = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const residents = await Resident.find({ isActive: true })
      .populate("userId", "_id name email phone")
      .sort({ createdAt: -1 });

    const data = residents
      .filter((resident) => resident.userId)
      .map((resident) => ({
        _id: resident.userId._id,
        residentRecordId: resident._id,
        name: resident.userId.name,
        email: resident.userId.email,
        phone: resident.userId.phone || "",
        buildingName: resident.buildingName || "",
        roomNo: resident.roomNo || "",
        notes: resident.notes || "",
        isActive: resident.isActive,
      }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch residents",
      error: error.message,
    });
  }
};

const createResident = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const {
      userId,
      name,
      email,
      password,
      phone,
      address,
      buildingName,
      roomNo,
      notes,
    } = req.body;

    let targetUser;

    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === "admin") {
        return res.status(400).json({ message: "Admin cannot be added as resident" });
      }

      targetUser = user;
    } else {
      if (!name || !email) {
        return res.status(400).json({
          message: "name and email are required for manual resident creation",
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existingUserByEmail = await User.findOne({ email: normalizedEmail });

      if (existingUserByEmail) {
        if (existingUserByEmail.role === "admin") {
          return res.status(400).json({
            message: "This email belongs to an admin account",
          });
        }

        targetUser = existingUserByEmail;
      } else {
        if (!password) {
          return res.status(400).json({
            message: "password is required for new resident creation",
          });
        }

        targetUser = await User.create({
          name,
          email: normalizedEmail,
          password,
          role: "resident",
          phone: phone || undefined,
          address: address || "",
          buildingName: buildingName || "",
          roomNo: roomNo || "",
        });
      }
    }

    if (name !== undefined) targetUser.name = name;
    if (phone !== undefined) targetUser.phone = phone || undefined;
    if (address !== undefined) targetUser.address = address;
    if (buildingName !== undefined) targetUser.buildingName = buildingName;
    if (roomNo !== undefined) targetUser.roomNo = roomNo;

    if (password) {
      targetUser.password = password;
    }

    await targetUser.save();

    const existingRecord = await Resident.findOne({ userId: targetUser._id });

    if (existingRecord?.isActive) {
      return res.status(400).json({ message: "Resident already exists" });
    }

    let resident;

    if (existingRecord && !existingRecord.isActive) {
      existingRecord.isActive = true;
      existingRecord.buildingName = buildingName ?? targetUser.buildingName ?? "";
      existingRecord.roomNo = roomNo ?? targetUser.roomNo ?? "";
      existingRecord.notes = notes || "";
      resident = await existingRecord.save();
    } else {
      resident = await Resident.create({
        userId: targetUser._id,
        buildingName: buildingName ?? targetUser.buildingName ?? "",
        roomNo: roomNo ?? targetUser.roomNo ?? "",
        notes: notes || "",
        createdBy: req.user._id,
        isActive: true,
      });
    }

    const populated = await Resident.findById(resident._id).populate(
      "userId",
      "_id name email phone"
    );

    return res.status(201).json({
      success: true,
      message: "Resident added successfully",
      data: {
        _id: populated.userId._id,
        residentRecordId: populated._id,
        name: populated.userId.name,
        email: populated.userId.email,
        phone: populated.userId.phone || "",
        buildingName: populated.buildingName || "",
        roomNo: populated.roomNo || "",
        notes: populated.notes || "",
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate resident data detected",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add resident",
      error: error.message,
    });
  }
};

const deleteResident = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { id } = req.params;
    const resident = await Resident.findById(id);

    if (!resident) {
      return res.status(404).json({ message: "Resident record not found" });
    }

    resident.isActive = false;
    await resident.save();

    return res.status(200).json({
      success: true,
      message: "Resident removed from active list",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete resident",
      error: error.message,
    });
  }
};

module.exports = {
  listResidents,
  createResident,
  deleteResident,
};