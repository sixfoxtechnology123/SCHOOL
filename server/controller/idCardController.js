const IdCard = require("../models/IdCard");
const StudentMaster = require("../models/Student");

// Get ID Card by studentId
exports.getIdCardByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    let idCard = await IdCard.findOne({ studentId });
    if (!idCard) {
      // Prefill from student if ID Card does not exist
      const student = await StudentMaster.findOne({ studentId });
      if (!student) return res.status(404).json({ error: "Student not found" });

      idCard = {
        studentId,
        studentName: student.studentName,
        dob: student.dob,
        className: student.className,
        bloodGroup: student.bloodGroup,
        fatherName: student.fatherName,
        motherName: student.motherName,
        contactNo: student.contactNo,
        whatsappNo: student.whatsappNo,
        permanentAddress: student.permanentAddress || {},
        photo: null,
      };
    }

    res.json(idCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ID Card" });
  }
};

// Create or Update ID Card
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
      // Update existing
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
    }

    res.json({ message: "ID Card saved successfully", idCard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save ID Card" });
  }
};
