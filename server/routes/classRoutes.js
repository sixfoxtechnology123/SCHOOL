const express = require("express");
const router = express.Router();
const {
  getAllClasses,
  getLatestClassId,
  createClass,
  updateClass,
  deleteClass,
  getUniqueClasses,
  getSectionsByClass,
} = require("../controller/classController");

router.get("/", getAllClasses);
router.get("/latest", getLatestClassId);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

// dropdown routes
router.get("/unique/classes", getUniqueClasses);
router.get("/sections/:className", getSectionsByClass);

module.exports = router;
