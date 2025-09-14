// controller/udiseController.js
const Udise = require("../models/Udise");
const StudentMaster = require("../models/Student");

// Get UDISE by studentId
exports.getUdiseByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    let udise = await Udise.findOne({ studentId });

    if (!udise) {
      const student = await StudentMaster.findOne({ studentId });
      if (!student) return res.status(404).json({ error: "Student not found" });

      udise = {
        _id: null,
        studentId: student.studentId,
        studentName: student.studentName || "",
        gender: student.gender || "",
        dob: student.dob || "",
        className: student.className || "",
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        guardianName: student.guardianName || "",
        religion: student.religion || "",
        nationality: "INDIAN",
        bpl: student.bpl || "",
        annualIncome: student.annualIncome || "",
        guardianQualification: student.guardianQualification || "",
        contactNo: student.contactNo || "",
        dist: student.permanentAddress?.dist || "",
        block: student.permanentAddress?.block || "",
        po: student.permanentAddress?.po || "",
        ps: student.permanentAddress?.ps || "",
        pin: student.permanentAddress?.pin || "",
        photo: null,
      };
    }

    res.json(udise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch UDISE" });
  }
};

// Create or Update UDISE
exports.saveUdise = async (req, res) => {
  try {
    const studentId = req.body.studentId || req.params.studentId;
    const photo = req.file ? { data: req.file.buffer, contentType: req.file.mimetype } : undefined;

    let udise = await Udise.findOne({ studentId });

    if (udise) {
      // update fields
      Object.assign(udise, req.body);
      if (photo) udise.photo = photo;
      await udise.save();
      return res.json({ message: "UDISE updated successfully", udise });
    } else {
      udise = new Udise({ ...req.body, studentId });
      if (photo) udise.photo = photo;
      await udise.save();
      return res.json({ message: "UDISE created successfully", udise });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save UDISE" });
  }
};
