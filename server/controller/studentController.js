const StudentMaster = require("../models/Student");
const ClassMaster = require("../models/Class");

const PREFIX = "G";
const PAD = 4;          // Example: G0001
const START_NUM = 101;  // First ID = G0101

//  Generate next Student ID
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
    return `${PREFIX}${String(START_NUM).padStart(PAD, "0")}`; // G0101
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

  if (!last.length) return 1; // first student in section
  return parseInt(last[0].rollNo, 10) + 1;
}


// GET next Student ID
exports.getLatestStudentId = async (_req, res) => {
  try {
    const nextId = await generateNextStudentId();
    res.json({ studentId: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get next student ID" });
  }
};

exports.getNextRollNo = async (req, res) => {
  try {
    const { className, section } = req.params;
    // console.log("getNextRollNo called with:", className, section);

    const lastStudent = await StudentMaster.find({ admitClass: className, section })
      .sort({ rollNo: -1 })
      .limit(1);

    // console.log("Last student found:", lastStudent);

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
exports.getAllStudents = async (_req, res) => {
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

// POST create student
exports.createStudent = async (req, res) => {
  try {
    const studentId = await generateNextStudentId();
    const rollNo = await generateNextRollNo(req.body.admitClass, req.body.section);

    const doc = new StudentMaster({ 
      ...req.body, 
      studentId,
      rollNo 
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create student" });
  }
};

// PUT update student
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.studentId) delete payload.studentId;

    const updated = await StudentMaster.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Student not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update student" });
  }
};

// DELETE student
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
