// controllers/studentController.js
const StudentMaster = require("../models/Student");
const ClassMaster = require("../models/Class"); // ensure you have this

const PREFIX = "ST";
const PAD = 4; // ST0001, ST0002

// Generate next Student ID (robust version)
async function generateNextStudentId() {
  const last = await StudentMaster.aggregate([
    {
      $addFields: {
        numId: {
          $toInt: { $replaceAll: { input: "$studentId", find: PREFIX, replacement: "" } }
        }
      }
    },
    { $sort: { numId: -1 } },
    { $limit: 1 }
  ]);

  if (!last.length) {
    return `${PREFIX}${String(1).padStart(PAD, "0")}`;
  }

  const nextNum = last[0].numId + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}


//  GET next Student ID
exports.getLatestStudentId = async (_req, res) => {
  try {
    const nextId = await generateNextStudentId();
    res.json({ studentId: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get next student ID" });
  }
};

//  GET all students (with className populated)
exports.getAllStudents = async (_req, res) => {
  try {
    const students = await StudentMaster.find().lean();

    // Optionally fetch className if you are storing classId
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

//  POST create student
exports.createStudent = async (req, res) => {
  try {
    const { name, className, section, rollNo, dob, fatherName, motherName, address, phoneNo } = req.body;

    const studentId = await generateNextStudentId();

    const doc = new StudentMaster({
      studentId,
      name,
      className, // should hold classId if you're linking to Classes table
      section,
      rollNo,
      dob,
      fatherName,
      motherName,
      address,
      phoneNo,
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create student" });
  }
};

//  PUT update student
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.studentId) delete payload.studentId; // Don't allow ID change

    const updated = await StudentMaster.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Student not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update student" });
  }
};

//  DELETE student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StudentMaster.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Student not found" });

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete student" });
  }
};
