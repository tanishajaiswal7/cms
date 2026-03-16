const express = require("express");
const router = express.Router();

const {
  listResidents,
  createResident,
  deleteResident,
} = require("../controllers/residentController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

router.get("/", protect, adminOnly, listResidents);
router.post("/", protect, adminOnly, createResident);
router.delete("/:id", protect, adminOnly, deleteResident);

module.exports = router;