import express from "express";
import multer from "multer";
import {
  getAllStudents,
  getLatestStudentId,
  createStudent,
  updateStudent,
  deleteStudent,
  getNextRollNo,
  getFullStudentInfo  // NEW: import full info method
} from "../controller/studentController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getAllStudents);
router.get("/latest", getLatestStudentId);
router.get("/next-roll/:className/:section", getNextRollNo);

//  NEW API Route
router.get("/:id/fullinfo", getFullStudentInfo);

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

export default router;
