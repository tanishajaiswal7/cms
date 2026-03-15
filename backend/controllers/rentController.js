const Rent = require("../models/Rent");
const User = require("../models/User");

// ================= CREATE RENT =================
const createRent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can create rent records",
      });
    }

    const {
      residentId,
      rentAmount,
      additionalCharges,
      fine,
      month,
      dueDate,
      notes,
    } = req.body;

    if (!residentId || !rentAmount || !month) {
      return res.status(400).json({
        message: "residentId, rentAmount and month are required",
      });
    }

    // Validate resident
    const resident = await User.findById(residentId);
    if (!resident || resident.role !== "resident") {
      return res.status(404).json({
        message: "Resident not found",
      });
    }

    // Prevent duplicate month record
    const existingRent = await Rent.findOne({
      residentId,
      month,
    });

    if (existingRent) {
      return res.status(400).json({
        message: "Rent already exists for this resident and month",
      });
    }

    // Safe numeric conversion
    const rent = new Rent({
      residentId,
      month,
      rentAmount: Number(rentAmount),
      additionalCharges: Number(additionalCharges) || 0,
      fine: Number(fine) || 0,
      dueDate: dueDate || null,
      notes: notes || "",
      createdBy: req.user._id,
    });

    await rent.save();

    res.status(201).json({
      success: true,
      message: "Rent record created successfully",
      data: rent,
    });
  } catch (error) {
    console.error("CREATE RENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error creating rent record",
      error: error.message,
    });
  }
};

// ================= GET ALL RENTS =================
const getAllRents = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can view rent records",
      });
    }

    const { residentId, status, month } = req.query;

    let query = {};

    if (residentId) query.residentId = residentId;
    if (status) query.status = status;
    if (month) query.month = month;

    const rents = await Rent.find(query)
      .populate("residentId", "name email phone")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rents.length,
      data: rents,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching rent records",
      error: error.message,
    });
  }
};

// ================= GET RENT BY RESIDENT =================
const getRentByResident = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { residentId } = req.params;

    if (
      req.user.role === "resident" &&
      req.user._id.toString() !== residentId
    ) {
      return res.status(403).json({
        message: "You can only view your own rent records",
      });
    }

    const rents = await Rent.find({ residentId })
      .populate("residentId", "name email phone")
      .sort({ month: -1 });

    res.status(200).json({
      success: true,
      count: rents.length,
      data: rents,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching rent records",
      error: error.message,
    });
  }
};

// ================= GET CURRENT MONTH RENT =================
const getCurrentMonthRent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const residentId = req.user._id;

    const now = new Date();
    const month = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const rent = await Rent.findOne({
      residentId,
      month,
    }).populate("residentId", "name email phone");

    if (!rent) {
      return res.status(404).json({
        message: "No rent found for current month",
      });
    }

    res.status(200).json({
      success: true,
      data: rent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching rent",
      error: error.message,
    });
  }
};

// ================= UPDATE RENT =================
const updateRent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can update rent",
      });
    }

    const { id } = req.params;

    const rent = await Rent.findById(id);

    if (!rent) {
      return res.status(404).json({
        message: "Rent record not found",
      });
    }

    const {
      rentAmount,
      additionalCharges,
      fine,
      dueDate,
      notes,
    } = req.body;

    if (rentAmount !== undefined) rent.rentAmount = Number(rentAmount);
    if (additionalCharges !== undefined)
      rent.additionalCharges = Number(additionalCharges);

    if (fine !== undefined) rent.fine = Number(fine);

    if (dueDate !== undefined) rent.dueDate = dueDate;
    if (notes !== undefined) rent.notes = notes;

    await rent.save();

    res.status(200).json({
      success: true,
      message: "Rent updated successfully",
      data: rent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating rent",
      error: error.message,
    });
  }
};

// ================= UPDATE RENT STATUS =================
const updateRentStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can update rent status",
      });
    }

    const { id } = req.params;
    const { status, paidAmount } = req.body;

    const rent = await Rent.findById(id);

    if (!rent) {
      return res.status(404).json({
        message: "Rent not found",
      });
    }

    if (status) rent.status = status;

    if (paidAmount !== undefined) {
      rent.paidAmount = Number(paidAmount);

      if (rent.paidAmount >= rent.totalAmount) {
        rent.status = "paid";
        rent.paidDate = new Date();
      } else if (rent.paidAmount > 0) {
        rent.status = "partial";
      }
    }

    await rent.save();

    res.status(200).json({
      success: true,
      message: "Rent status updated",
      data: rent,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating rent status",
      error: error.message,
    });
  }
};

// ================= DELETE RENT =================
const deleteRent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can delete rent",
      });
    }

    const { id } = req.params;

    const rent = await Rent.findByIdAndDelete(id);

    if (!rent) {
      return res.status(404).json({
        message: "Rent not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Rent deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting rent",
      error: error.message,
    });
  }
};

// ================= RENT STATISTICS =================
const getRentStatistics = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can view statistics",
      });
    }

    const totalRents = await Rent.countDocuments();
    const paidRents = await Rent.countDocuments({ status: "paid" });
    const unpaidRents = await Rent.countDocuments({ status: "unpaid" });
    const partialRents = await Rent.countDocuments({ status: "partial" });

    const totalAmount = await Rent.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRents,
        paidRents,
        unpaidRents,
        partialRents,
        totalRentDue: totalAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

module.exports = {
  createRent,
  getAllRents,
  getRentByResident,
  getCurrentMonthRent,
  updateRent,
  updateRentStatus,
  deleteRent,
  getRentStatistics,
};
