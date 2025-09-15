const Udise = require("../models/Udise");
const StudentMaster = require("../models/Student");

// Get UDISE by studentId
exports.getUdiseByStudentId = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    if (!studentId) return res.status(400).json({ error: "Student ID is required" });

    let udise = await Udise.findOne({ studentId });

    if (!udise) {
      // fallback from StudentMaster
      const student = await StudentMaster.findOne({ studentId });
      if (!student) return res.status(404).json({ error: "Student not found" });

      udise = {
        _id: null,
        studentId: student.studentId,
        studentName: student.studentName || "",
        gender: student.gender || "",
        dob: student.dob || "",
        className: student.className || "",
        admitClass: student.admitClass || "",
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        guardianName: student.fatherName || "",
        guardianQualification: student.fatherQualification || "",
        fatherQualification: student.fatherQualification || "",
        motherTongue: "",
        socialCaste: "",  
        religion: student.religion || "",
        nationality: "INDIAN",
        bpl: student.bpl || "No",
        bplNo: "",
        ews: "",            
        familyIncome: student.familyIncome || "",
        contactNo: student.contactNo || "",
        cwsn: "",
        currentAddress: {
          vill: "",
          po: "",
          block: "",
          pin: "",
          ps: "",
          dist: "",
        },
        panchayat: "",
        photo: null,
      };
    }

    res.json(udise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch UDISE" });
  }
};

// Save UDISE
exports.saveUdise = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.body.studentId;
    if (!studentId) return res.status(400).json({ error: "Student ID is required" });

    let currentAddress = {};
    if (req.body.currentAddress) {
      if (typeof req.body.currentAddress === "string") {
        currentAddress = JSON.parse(req.body.currentAddress);
      } else {
        currentAddress = req.body.currentAddress;
      }
    }

    const photo = req.file
      ? { data: req.file.buffer, contentType: req.file.mimetype }
      : undefined;

    const udiseData = {
      studentName: req.body.studentName || "",
      gender: req.body.gender || "",
      height: req.body.height || "",
      weight: req.body.weight || "",
      dob: req.body.dob || "",
      className: req.body.className || "",
      admitClass: req.body.admitClass || "",
      motherTongue: req.body.motherTongue || "",
      socialCaste: req.body.socialCaste || "",
      fatherName: req.body.fatherName || "",
      motherName: req.body.motherName || "",
      guardianName: req.body.fatherName || "",
      guardianQualification: req.body.fatherQualification || "",
      fatherQualification: req.body.fatherQualification || "",
      religion: req.body.religion || "",
      nationality: req.body.nationality || "INDIAN",
      bpl: req.body.bpl || "No",
      bplNo: req.body.bplNo || "",
      ews: req.body.ews || "",  
      familyIncome: req.body.familyIncome || "",
      contactNo: req.body.contactNo || "",
      cwsn: req.body.cwsn || "",
      panchayat: req.body.panchayat || "",
      currentAddress,
    };

    if (photo) udiseData.photo = photo;

    let udise = await Udise.findOne({ studentId });

    if (udise) {
      Object.assign(udise, udiseData);
      await udise.save();
      return res.json({ message: "UDISE updated successfully", udise });
    } else {
      udise = new Udise({ studentId, ...udiseData });
      await udise.save();
      return res.json({ message: "UDISE created successfully", udise });
    }
  } catch (err) {
    console.error("Error saving UDISE:", err);
    res.status(500).json({ error: "Failed to save UDISE" });
  }
};
