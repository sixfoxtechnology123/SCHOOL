const IdCard = require("../models/IdCard");
const StudentMaster = require("../models/Student");

// Get ID Card by studentId
// Get ID Card by studentId
exports.getIdCardByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    let idCard = await IdCard.findOne({ studentId });

    if (!idCard) {
      // Prefill from StudentMaster if ID Card does not exist
      const student = await StudentMaster.findOne({ studentId });
      if (!student) return res.status(404).json({ error: "Student not found" });

      idCard = {
        _id: null, // frontend expects _id
        studentId: student.studentId,
        studentName: student.studentName || "",
        dob: student.dob || "",
        admitClass: student.className || "",   // <-- renamed for frontend
        bloodGroup: student.bloodGroup || "",
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        fatherPhone: student.contactNo || "",  // <-- renamed for frontend
        whatsappNo: student.whatsappNo || "",
        permanentAddress: student.permanentAddress || {
          vill: "",
          po: "",
          block: "",
          pin: "",
          ps: "",
          dist: "",
        },
        photo: null,
      };
    } else {
      // Map existing ID card to frontend fields
      idCard = {
        _id: idCard._id,
        studentId: idCard.studentId,
        studentName: idCard.studentName || "",
        dob: idCard.dob || "",
        admitClass: idCard.className || "",   // <-- renamed
        bloodGroup: idCard.bloodGroup || "",
        fatherName: idCard.fatherName || "",
        motherName: idCard.motherName || "",
        fatherPhone: idCard.contactNo || "",  // <-- renamed
        whatsappNo: idCard.whatsappNo || "",
        permanentAddress: idCard.permanentAddress || {
          vill: "",
          po: "",
          block: "",
          pin: "",
          ps: "",
          dist: "",
        },
        photo: idCard.photo || null,
      };
    }

    res.json(idCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ID Card" });
  }
};


// Create or Update ID Card (by studentId)
exports.saveIdCard = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      dob,
      className,
      bloodGroup,
      fatherName,
      motherName,
      contactNo,
      whatsappNo,
    } = req.body;

    const permanentAddress = JSON.parse(req.body.permanentAddress || "{}");

    const photo = req.file
      ? { data: req.file.buffer, contentType: req.file.mimetype }
      : undefined;

    let idCard = await IdCard.findOne({ studentId });

    if (idCard) {
      // Update existing by studentId
      idCard.studentName = studentName;
      idCard.dob = dob;
      idCard.className = className;
      idCard.bloodGroup = bloodGroup;
      idCard.fatherName = fatherName;
      idCard.motherName = motherName;
      idCard.contactNo = contactNo;
      idCard.whatsappNo = whatsappNo;
      idCard.permanentAddress = permanentAddress;
      if (photo) idCard.photo = photo;

      await idCard.save();
      return res.json({ message: "ID Card updated successfully", idCard });
    } else {
      // Create new
      idCard = new IdCard({
        studentId,
        studentName,
        dob,
        className,
        bloodGroup,
        fatherName,
        motherName,
        contactNo,
        whatsappNo,
        permanentAddress,
        photo,
      });
      await idCard.save();
      return res.json({ message: "ID Card created successfully", idCard });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save ID Card" });
  }
};
