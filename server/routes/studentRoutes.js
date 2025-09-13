import express from "express";
import multer from "multer";
import {
  getAllStudents,
  getLatestStudentId,
  createStudent,
  updateStudent,
  deleteStudent,
  getNextRollNo
} from "../controller/studentController.js";

const router = express.Router();

// --- Multer setup to store images in memory (not in project folder) ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- Routes ---
router.get("/", getAllStudents);
router.get("/latest", getLatestStudentId);
router.get("/next-roll/:className/:section", getNextRollNo);

// --- Create student with photo upload ---
router.post(
  "/",
  upload.fields([
    { name: "fatherPhoto" },
    { name: "motherPhoto" },
    { name: "childPhoto" },
  ]),
  createStudent
);

router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

// --- Optional: serve images for frontend ---
router.get("/students/:id/photo/:type", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const type = req.params.type; // fatherPhoto, motherPhoto, childPhoto

    if (!student || !student[type]) return res.status(404).send("Image not found");

    res.contentType(student[type].contentType);
    res.send(student[type].data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
