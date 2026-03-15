const Payment = require("../models/Payment");
const Rent = require("../models/Rent");
const User = require("../models/User");

/**
 * Get all payments with filters (Admin only)
 * GET /api/admin/payments
 */
const getAllPayments = async (req, res) => {
  try {
    // Verify admin role (should be checked in middleware)
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const {
      status,
      residentId,
      rentId,
      startDate,
      endDate,
      limit = 20,
      skip = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter query
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (residentId) {
      filter.residentId = residentId;
    }

    if (rentId) {
      filter.rentId = rentId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sort = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Query payments
    const payments = await Payment.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("residentId", "name email phone")
      .populate("rentId", "month rentAmount totalAmount");

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payments",
    });
  }
};

/**
 * Get payment statistics for dashboard (Admin only)
 * GET /api/admin/payments/stats
 */
const getPaymentStats = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Get statistics
    const stats = await Payment.aggregate([
      { $match: dateFilter },
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalPayments: { $sum: 1 },
                totalAmount: { $sum: "$amount" },
                avgAmount: { $avg: "$amount" },
              },
            },
          ],
          byStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                total: { $sum: "$amount" },
              },
            },
            {
              $sort: { count: -1 },
            },
          ],
          byPaymentMethod: [
            {
              $group: {
                _id: "$paymentMethodType",
                count: { $sum: 1 },
                total: { $sum: "$amount" },
              },
            },
          ],
          dailyStats: [
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                  },
                },
                count: { $sum: 1 },
                total: { $sum: "$amount" },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ],
          topResidents: [
            {
              $group: {
                _id: "$residentId",
                totalPaid: { $sum: "$amount" },
                paymentCount: { $sum: 1 },
              },
            },
            {
              $sort: { totalPaid: -1 },
            },
            {
              $limit: 5,
            },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "resident",
              },
            },
          ],
        },
      },
    ]);

    // Format response
    const response = {
      success: true,
      data: {
        summary: stats[0].totalStats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          avgAmount: 0,
        },
        byStatus: stats[0].byStatus,
        byPaymentMethod: stats[0].byPaymentMethod,
        dailyStats: stats[0].dailyStats,
        topResidents: stats[0].topResidents.map((item) => ({
          residentId: item._id,
          resident: item.resident[0],
          totalPaid: item.totalPaid,
          paymentCount: item.paymentCount,
        })),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payment statistics",
    });
  }
};

/**
 * Get payment details for admin (Admin only)
 * GET /api/admin/payments/:paymentId
 */
const getPaymentDetailsAdmin = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate("residentId", "name email phone address")
      .populate("rentId", "month rentAmount totalAmount propertyId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payment details",
    });
  }
};

/**
 * Export payment records to CSV/JSON (Admin only)
 * GET /api/admin/payments/export/:format
 */
const exportPayments = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const { format } = req.params;
    const { status, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get payments
    const payments = await Payment.find(filter)
      .populate("residentId", "name email phone")
      .populate("rentId", "month rentAmount totalAmount")
      .lean();

    if (format === "csv") {
      // Convert to CSV format
      const csv = convertToCSV(payments);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="payments_export.csv"'
      );
      res.send(csv);
    } else if (format === "json") {
      // Return JSON
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="payments_export.json"'
      );
      res.json(payments);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid format. Use 'csv' or 'json'",
      });
    }
  } catch (error) {
    console.error("Error exporting payments:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to export payments",
    });
  }
};

/**
 * Helper function to convert payments to CSV format
 */
const convertToCSV = (payments) => {
  const headers = [
    "Payment ID",
    "Resident Name",
    "Email",
    "Amount",
    "Status",
    "Payment Method",
    "Month",
    "Paid Date",
    "Created Date",
  ];

  const rows = payments.map((payment) => [
    payment._id.toString(),
    payment.residentId?.name || "N/A",
    payment.residentId?.email || "N/A",
    payment.amount,
    payment.status,
    payment.paymentMethodType,
    payment.rentId?.month || "N/A",
    payment.paidAt?.toISOString().split("T")[0] || "N/A",
    payment.createdAt?.toISOString().split("T")[0] || "N/A",
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csv;
};

/**
 * Get resident payment history (Admin only)
 * GET /api/admin/payments/resident/:residentId
 */
const getResidentPaymentHistory = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }

    const { residentId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    // Verify resident exists
    const resident = await User.findById(residentId).select(
      "name email phone address"
    );
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Resident not found",
      });
    }

    // Get resident payments
    const payments = await Payment.find({ residentId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("rentId", "month rentAmount totalAmount");

    const total = await Payment.countDocuments({ residentId });

    // Calculate summary
    const summary = {
      totalPayments: total,
      totalPaid: payments
        .filter((p) => p.status === "succeeded")
        .reduce((sum, p) => sum + p.amount, 0),
      successfulPayments: payments.filter((p) => p.status === "succeeded")
        .length,
      failedPayments: payments.filter((p) => p.status === "failed").length,
      refundedPayments: payments.filter((p) => p.status === "refunded").length,
      totalRefunded: payments
        .filter((p) => p.status === "refunded")
        .reduce((sum, p) => sum + p.refundAmount, 0),
    };

    res.status(200).json({
      success: true,
      data: {
        resident,
        payments,
        summary,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching resident payments:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch resident payments",
    });
  }
};

module.exports = {
  getAllPayments,
  getPaymentStats,
  getPaymentDetailsAdmin,
  exportPayments,
  getResidentPaymentHistory,
};
