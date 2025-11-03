import express from "express";
import multer from "multer";
import {
  getAllStudents,
  getLatestStudentId,
  createStudent,
  updateStudent,
  getNextRollNo,
  getFullStudentInfo,
  getAllAcademicSessions,
  checkUdiseExists,
  deleteStudentController,
  getStudentByStudentId,
  getLatestAdmissionNo,
  getLatestStudentBySession,
} from "../controller/studentController.js";
import StudentMaster from "../models/Student.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/check-udise/:studentId", checkUdiseExists);
// get student by studentId
router.get("/by-studentId/:studentId", getStudentByStudentId);

// Serve student photos
router.get("/students/:id/photo/:type", async (req, res) => {
  try {
   const student = await StudentMaster.findOne({ studentId: req.params.id });

    const type = req.params.type;
    if (!student || !student[type]) return res.status(404).send("Image not found");

    res.contentType(student[type].contentType);
    res.send(student[type].data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// New endpoint for frontend to fetch ID Card + UDISE
router.get("/:studentId/idcard-udise", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await StudentMaster.findOne({ studentId }).lean();
    if (!student) return res.status(404).json({ error: "Student not found" });

    res.json({
      idCardInfo: {
        whatsappNo: student.whatsappNo || "",
        permanentAddress: student.permanentAddress || {},
        idCardPhoto: student.idCardPhoto
  ? `data:${student.idCardPhoto.contentType};base64,${student.idCardPhoto.data.toString('base64')}`
  : null,
      },
      udiseInfo: {
       udisePhoto: student.udisePhoto
  ? `data:${student.udisePhoto.contentType};base64,${student.udisePhoto.data.toString('base64')}`
  : null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch ID Card & UDISE" });
  }
});

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
    { name: "otherDocument" },
    { name: "idCardPhoto" }, 
    { name: "udisePhoto" } 
  ]),
  createStudent
);

// Update student by admissionNo
router.put(
  "/update/:admissionNo",
  upload.fields([
    { name: "fatherPhoto" },
    { name: "motherPhoto" },
    { name: "childPhoto" },
    { name: "otherDocument" },
    { name: "idCardPhoto" },
    { name: "udisePhoto" },
  ]),
  updateStudent
);


// DELETE /api/students/:id
router.delete("/:id", deleteStudentController);
router.get("/latest-admission", getLatestAdmissionNo);
router.get("/latest/:session", getLatestStudentBySession);

router.get("/academic-sessions", getAllAcademicSessions);

export default router;
