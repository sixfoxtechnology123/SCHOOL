// routes/classRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllClasses,
  getLatestClassId,
  createClass,
  updateClass,
  deleteClass,
} = require("../controller/classController");

router.get("/", getAllClasses);
router.get("/latest", getLatestClassId);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

module.exports = router;
