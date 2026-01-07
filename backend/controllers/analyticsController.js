const Complaint = require("../models/Complaint");

const getComplaintSummary = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();

    const pending = await Complaint.countDocuments({ status: "Pending" });
    const inProgress = await Complaint.countDocuments({ status: "In Progress" });
    const resolved = await Complaint.countDocuments({ status: "Resolved" });

    res.json({
      total,
      pending,
      inProgress,
      resolved,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};



const getCategoryDistribution = async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 }, // most frequent first
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch category distribution",
      error: error.message,
    });
  }
};


// 📈 Complaints Trend (Weekly / Monthly)
const getComplaintTrends = async (req, res) => {
  try {
    const type = req.query.type || "weekly";

    // days range
    const days = Number(req.query.days) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json(trends);
  } catch (error) {
    console.error("Trend analytics error:", error);
    res.status(500).json({ message: "Failed to load trends" });
  }
};

// ⏱ Average Resolution Time
const getAverageResolutionTime = async (req, res) => {
  try {
    const result = await Complaint.aggregate([
      {
        $match: {
          status: "Resolved",
          resolvedAt: { $ne: null },
        },
      },
      {
        $project: {
          resolutionTimeInMs: {
            $subtract: ["$resolvedAt", "$createdAt"],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: "$resolutionTimeInMs" },
        },
      },
    ]);

    if (result.length === 0) {
      return res.json({ averageTimeInDays: 0 });
    }

    const avgMs = result[0].avgResolutionTime;
    const avgDays = avgMs / (1000 * 60 * 60 * 24);

    res.json({
      averageTimeInDays: avgDays.toFixed(2),
    });
  } catch (error) {
    console.error("Average resolution error:", error);
    res.status(500).json({ message: "Failed to calculate resolution time" });
  }
};


// 🚨 Pending > X Days Alerts
const getPendingAlerts = async (req, res) => {
  try {
    const days = Number(req.query.days) || 5;

    const cutoffDate = new Date();//aaj ka date 
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const alerts = await Complaint.find({
      status: "Pending",
      createdAt: { $lte: cutoffDate },
    })
      .select("title category createdAt")
      .sort({ createdAt: 1 });

    res.json({
      days,
      count: alerts.length,
      complaints: alerts.map((c) => ({
        id: c._id,
        title: c.title,
        category: c.category,
        daysPending: Math.floor(
          (Date.now() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24)
        ),
      })),
    });
  } catch (error) {
    console.error("Pending alerts error:", error);
    res.status(500).json({ message: "Failed to load pending alerts" });
  }
};




module.exports = { getComplaintSummary,getCategoryDistribution,getComplaintTrends,getAverageResolutionTime ,getPendingAlerts};
