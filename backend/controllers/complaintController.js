const Complaint = require("../models/Complaint");
const ServiceProvider = require("../models/ServiceProvider");
const sendWhatsApp = require("../utils/whatsapp");
const User = require("../models/User");

// ================= CREATE COMPLAINT =================
const createComplaint = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const complaint = await Complaint.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      otherCategoryReason: req.body.otherCategoryReason,
      societyName: req.body.societyName,
      block: req.body.block,
      roomNumber: req.body.roomNumber,
      createdBy: req.user._id,
      images: req.files ? req.files.map((file) => file.path) : [],
    });

    // ✅ Respond first
    res.status(201).json({
      message: "Complaint created successfully",
      data: complaint,
    });

    // 🔔 Notify Admins
    try {
      const admins = await User.find({
        role: "admin",
        phone: { $exists: true },
      });

      for (const admin of admins) {
        if (!admin.phone) continue;

        const formattedPhone = `+91${admin.phone}`;

        await sendWhatsApp(
          formattedPhone,
          `🆕 New Complaint Raised


Category: ${complaint.category}
Society: ${complaint.societyName}
Block:${complaint.block}
Room Number:${complaint.roomNumber}`
        );
      }
    } catch (err) {
      console.error("Admin WhatsApp failed");
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to create complaint",
      error: error.message,
    });
  }
};

// ================= GET ALL COMPLAINTS =================
const getAllComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, status, category } = req.query;
    let query = {};

    if (req.user.role === "resident") {
      query.createdBy = req.user._id;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate("createdBy", "name email role phone")
      .populate("assignedProvider", "name role phone active")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComplaints = await Complaint.countDocuments(query);

    res.json({
      page,
      limit,
      totalComplaints,
      totalPages: Math.ceil(totalComplaints / limit),
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

// ================= UPDATE COMPLAINT STATUS =================
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminMessage } = req.body;

    const complaint = await Complaint.findById(req.params.id).populate(
      "createdBy",
      "name email phone"
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;

    if (status === "Resolved") {
      complaint.resolvedAt = new Date();
    }

    if (adminMessage) {
      complaint.adminMessage = adminMessage;
      complaint.adminName = req.user.name;
    }

    await complaint.save();

    res.json({
      message: "Complaint status updated",
      data: complaint,
    });

    // 🔔 Notify Resident
    try {
      if (complaint.createdBy.phone) {
        const formattedPhone = `whatsapp:+91${complaint.createdBy.phone}`;

        await sendWhatsApp(
          formattedPhone,
          `📢 Complaint Update

"${complaint.title}"
Status: ${status}

Message: ${adminMessage || "No message"}

👉 Please check app for more details`
        );
      }
    } catch (err) {
      console.error("Resident WhatsApp failed");
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to update complaint",
      error: error.message,
    });
  }
};

// ================= DELETE COMPLAINT =================
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (
      req.user.role === "resident" &&
      complaint.createdBy.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this complaint" });
    }

    await complaint.deleteOne();
    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete complaint",
      error: error.message,
    });
  }
};

// ================= ASSIGN PROVIDER =================
const assignProvider = async (req, res) => {
  try {
    const { providerId } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.assignedProvider = providerId;
    await complaint.save();

    res.json({
      message: "Service provider assigned successfully",
      data: complaint,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  assignProvider,
};
