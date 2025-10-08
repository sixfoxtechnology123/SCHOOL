const StudentMaster = require("../models/Student");

// Get UDISE by studentId (prefill from StudentMaster)
exports.getUdiseByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ error: "Student ID is required" });

    const student = await StudentMaster.findOne({ studentId }).lean();
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Prepare UDISE info from StudentMaster
    const udise = {
      _id: student._id,
      studentId: student.studentId,
      studentName: (student.firstName || "") + " " + (student.lastName || ""),
      gender: student.gender || "",
      dob: student.dob || "",
      admitClass: student.admitClass || "",
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      guardianName: student.fatherName || "",
      guardianQualification: student.fatherQualification || "",
      fatherQualification: student.fatherQualification || "",
      motherTongue: student.motherTongue || "",
      socialCaste: student.socialCaste || "",
      religion: student.religion || "",
      nationality: student.nationality || "INDIAN",
      bpl: student.bpl || "No",
      bplNo: student.bplNo || "",
      ews: student.ews || "",
      familyIncome: student.familyIncome || "",
      contactNo: student.contactNo || "",
      cwsn: student.cwsn || "",
      panchayat: student.panchayat || "",
      currentAddress: student.currentAddress || {
        vill: "", po: "", block: "", pin: "", ps: "", dist: ""
      },
      udisePhoto: student.udisePhoto || null,
    };

    res.json(udise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch UDISE" });
  }
};

// Save or update UDISE data in StudentMaster
exports.saveUdise = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: "Student ID is required" });

    const student = await StudentMaster.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Update UDISE-related fields
    student.motherTongue = req.body.motherTongue || student.motherTongue;
    student.socialCaste = req.body.socialCaste || student.socialCaste;
    student.religion = req.body.religion || student.religion;
    student.ews = req.body.ews || student.ews;
    student.contactNo = req.body.contactNo || student.contactNo;
    student.cwsn = req.body.cwsn || student.cwsn;
    student.panchayat = req.body.panchayat || student.panchayat;
    student.familyIncome = req.body.familyIncome || student.familyIncome;
    student.currentAddress = req.body.currentAddress || student.currentAddress;

    if (req.file) {
      student.udisePhoto = { data: req.file.buffer, contentType: req.file.mimetype };
    }

    await student.save();

    res.json({
      message: "UDISE info saved successfully",
      student: {
        _id: student._id,
        studentId: student.studentId,
        studentName: (student.firstName || "") + " " + (student.lastName || ""),
        motherTongue: student.motherTongue || "",
        socialCaste: student.socialCaste || "",
        religion: student.religion || "",
        ews: student.ews || "",
        contactNo: student.contactNo || "",
        cwsn: student.cwsn || "",
        panchayat: student.panchayat || "",
        familyIncome: student.familyIncome || "",
        currentAddress: student.currentAddress || {},
        udisePhoto: student.udisePhoto || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save UDISE" });
  }
};
