const express = require("express");
const router = express.Router();

const {
  listResidents,
  createResident,
  deleteResident,
} = require("../controllers/residentController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/", protect, listResidents);
router.post("/", protect, createResident);
router.delete("/:id", protect, deleteResident);

module.exports = router;