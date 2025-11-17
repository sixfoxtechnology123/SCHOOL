const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllClasses,
  getLatestClassId,
  createClass,
  updateClass,
  deleteClass,
  getUniqueClasses,
  getSectionsByClass,
} = require("../controller/classController");

// Public routes
router.get("/", getAllClasses);
router.get("/latest", getLatestClassId);
router.post("/", createClass);

// Dropdown routes
router.get("/unique/classes", getUniqueClasses);
router.get("/sections/:className", getSectionsByClass);

// Admin-only routes
//router.put("/:id", authMiddleware, adminOnly, updateClass);
router.put("/:id", updateClass);
router.delete("/:id", authMiddleware, adminOnly, deleteClass);

module.exports = router;
