import express from "express";
import multer from "multer";
import {
  getAllStudents,
  getLatestStudentId,
  createStudent,
  updateStudent,
  deleteStudent,
  getNextRollNo,
  getFullStudentInfo,
  getIdCardAndUdise,
  
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

//  New endpoint for frontend to fetch ID Card + UDISE
router.get("/:studentId/idcard-udise", async (req, res) => {
  try {
    const { studentId } = req.params;
    const data = await getIdCardAndUdise(studentId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch ID Card & UDISE" });
  }
});

router.get("/:id/full", getFullStudentInfo);

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
]), updateStudent);

router.delete("/:id", deleteStudent);

export default router;
