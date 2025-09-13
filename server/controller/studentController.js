import StudentMaster from "../models/Student.js";
import ClassMaster from "../models/Class.js";

const PREFIX = "G";
const PAD = 4;          // Example: G0001
const START_NUM = 101;  // First ID = G0101

// Generate next Student ID
async function generateNextStudentId() {
  const lastStudent = await StudentMaster.aggregate([
    { $match: { studentId: { $regex: `^${PREFIX}\\d+$` } } },
    {
      $addFields: {
        numId: { $toInt: { $substr: ["$studentId", PREFIX.length, -1] } }
      }
    },
    { $sort: { numId: -1 } },
    { $limit: 1 }
  ]);

  if (!lastStudent.length) {
    return `${PREFIX}${String(START_NUM).padStart(PAD, "0")}`;
  }

  const nextNum = lastStudent[0].numId + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// Generate next Roll No (per class + section)
async function generateNextRollNo(admitClass, section) {
  const last = await StudentMaster.find({ admitClass, section })
    .sort({ rollNo: -1 })
    .limit(1)
    .lean();

  if (!last.length) return 1;
  return parseInt(last[0].rollNo, 10) + 1;
}

// GET next Student ID
export const getLatestStudentId = async (_req, res) => {
  try {
    const nextId = await generateNextStudentId();
    res.json({ studentId: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get next student ID" });
  }
};

// GET next Roll No
export const getNextRollNo = async (req, res) => {
  try {
    const { className, section } = req.params;

    const lastStudent = await StudentMaster.find({ admitClass: className, section })
      .sort({ rollNo: -1 })
      .limit(1);

    let nextRoll = 1;
    if (lastStudent.length) {
      nextRoll = parseInt(lastStudent[0].rollNo, 10) + 1;
    }

    res.json({ rollNo: nextRoll });
  } catch (err) {
    console.error("Error in getNextRollNo:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET all students
export const getAllStudents = async (_req, res) => {
  try {
    const students = await StudentMaster.find().lean();
    const classIds = [...new Set(students.map((s) => s.className))];
    const classes = await ClassMaster.find({ classId: { $in: classIds } }).lean();
    const classMap = Object.fromEntries(classes.map((c) => [c.classId, c.className]));

    const enriched = students.map((s) => ({
      ...s,
      classLabel: classMap[s.className] || s.className,
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
};

// POST create student with photos in MongoDB
export const createStudent = async (req, res) => {
  try {
    const studentId = await generateNextStudentId();
    const rollNo = await generateNextRollNo(req.body.admitClass, req.body.section);

    const newStudent = new StudentMaster({
      ...req.body,
      studentId,
      rollNo,
      fatherPhoto: req.files?.fatherPhoto
        ? { data: req.files.fatherPhoto[0].buffer, contentType: req.files.fatherPhoto[0].mimetype }
        : null,
      motherPhoto: req.files?.motherPhoto
        ? { data: req.files.motherPhoto[0].buffer, contentType: req.files.motherPhoto[0].mimetype }
        : null,
      childPhoto: req.files?.childPhoto
        ? { data: req.files.childPhoto[0].buffer, contentType: req.files.childPhoto[0].mimetype }
        : null,
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create student" });
  }
};

// PUT update student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.studentId) delete payload.studentId;

    const student = await StudentMaster.findById(id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    Object.assign(student, payload);

    // Update photos if uploaded
    if (req.files?.fatherPhoto) {
      student.fatherPhoto = { data: req.files.fatherPhoto[0].buffer, contentType: req.files.fatherPhoto[0].mimetype };
    }
    if (req.files?.motherPhoto) {
      student.motherPhoto = { data: req.files.motherPhoto[0].buffer, contentType: req.files.motherPhoto[0].mimetype };
    }
    if (req.files?.childPhoto) {
      student.childPhoto = { data: req.files.childPhoto[0].buffer, contentType: req.files.childPhoto[0].mimetype };
    }

    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update student" });
  }
};

// DELETE student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StudentMaster.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete student" });
  }
};
