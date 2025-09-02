// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  getLatestStudentId,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controller/studentController");

router.get("/", getAllStudents);
router.get("/latest", getLatestStudentId);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
