const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  getLatestStudentId,
  createStudent,
  updateStudent,
  deleteStudent,
  getNextRollNo   // make sure this is imported
} = require("../controller/studentController");

router.get("/", getAllStudents);
router.get("/latest", getLatestStudentId);
router.get("/next-roll/:className/:section", getNextRollNo); // ✅ must exist
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
