const express = require("express");
const upload = require("../config/multer");
const {
  createComplaint,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  assignProvider
} = require("../controllers/complaintController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { complaintLimiter, apiLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

router.post("/", protect, complaintLimiter, upload.array("images", 5), createComplaint);
router.get("/", protect, getAllComplaints);
router.put("/:id", protect, adminOnly, apiLimiter, updateComplaintStatus);
router.delete("/:id", protect, apiLimiter, deleteComplaint);
router.put(
  "/:id/assign",
  protect,
  adminOnly,
  apiLimiter,
  assignProvider
);



module.exports = router;
