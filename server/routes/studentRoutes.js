import express from "express";
import multer from "multer";
import {
  getAllStudents,
  getLatestStudentId,
  createStudent,
  updateStudent,
  deleteStudent,
  getNextRollNo,
  getFullStudentInfo
} from "../controller/studentController.js";
import StudentMaster from "../models/Student.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve student photos
router.get("/students/:id/photo/:type", async (req, res) => {
  try {
    const student = await StudentMaster.findById(req.params.id);
    const type = req.params.type;

    if (!student || !student[type]) return res.status(404).send("Image not found");

    res.contentType(student[type].contentType);
    res.send(student[type].data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get full student info
router.get("/:id/fullinfo", getFullStudentInfo);

// Standard CRUD routes
router.get("/", getAllStudents);
router.get("/latest", getLatestStudentId);
router.get("/next-roll/:className/:section", getNextRollNo);

router.post(
  "/",
  upload.fields([
    { name: "fatherPhoto" },
    { name: "motherPhoto" },
    { name: "childPhoto" },
  ]),
  createStudent
);

router.put("/:id", upload.fields([
  { name: "fatherPhoto" },
  { name: "motherPhoto" },
  { name: "childPhoto" },
]), updateStudent); // now updates properly
router.delete("/:id", deleteStudent);

export default router;
