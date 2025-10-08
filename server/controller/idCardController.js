const StudentMaster = require("../models/Student");

// Get ID Card by studentId (prefill from StudentMaster)
exports.getIdCardByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await StudentMaster.findOne({ studentId }).lean();
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Prepare ID Card info from StudentMaster
    const idCard = {
      _id: student._id,
      studentId: student.studentId,
      studentName: (student.firstName || "") + " " + (student.lastName || ""),
      dob: student.dob || "",
      admitClass: student.admitClass || "",
      bloodGroup: student.bloodGroup || "",
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      fatherPhone: student.fatherPhone || "",
      whatsappNo: student.whatsappNo || "",
      permanentAddress: student.permanentAddress || {
        vill: "", po: "", block: "", pin: "", ps: "", dist: ""
      },
      idCardPhoto: student.idCardPhoto || null,
    };

    res.json(idCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ID Card" });
  }
};

// Save or update ID Card data in StudentMaster
exports.saveIdCard = async (req, res) => {
  try {
    const { studentId, whatsappNo } = req.body;

    const student = await StudentMaster.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Update fields
    student.whatsappNo = whatsappNo || student.whatsappNo;

    if (req.file) {
      student.idCardPhoto = { data: req.file.buffer, contentType: req.file.mimetype };
    }

    await student.save();

    res.json({
      message: "ID Card info saved successfully",
      student: {
        _id: student._id,
        studentId: student.studentId,
        studentName: (student.firstName || "") + " " + (student.lastName || ""),
        whatsappNo: student.whatsappNo || "",
        idCardPhoto: student.idCardPhoto || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save ID Card" });
  }
};
