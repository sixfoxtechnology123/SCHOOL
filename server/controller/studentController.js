import StudentMaster from "../models/Student.js";
import ClassMaster from "../models/Class.js";
import AcademicSession from "../models/AcademicSession.js";

const PREFIX = "G";
const PAD = 4;
const START_NUM = 101;

// ===== Generate Next Student ID =====
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

// ===== Generate Next Roll No =====
async function generateNextRollNo(admitClass, section) {
  const last = await StudentMaster.find({ admitClass, section })
    .sort({ rollNo: -1 })
    .limit(1)
    .lean();

  let nextRoll = 1;
  if (last.length) nextRoll = parseInt(last[0].rollNo, 10) + 1;
  return String(nextRoll).padStart(2, "0");
}

// ===== Get Latest Student ID =====
export const getLatestStudentId = async (_req, res) => {
  try {
    const nextId = await generateNextStudentId();
    res.json({ studentId: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get next student ID" });
  }
};

// ===== Get Next Roll No =====
export const getNextRollNo = async (req, res) => {
  try {
    const { className, section } = req.params;

    const lastStudent = await StudentMaster.find({ admitClass: className, section })
      .sort({ rollNo: -1 })
      .limit(1);

    let nextRoll = 1;
    if (lastStudent.length) nextRoll = parseInt(lastStudent[0].rollNo, 10) + 1;

    res.json({ rollNo: String(nextRoll).padStart(2, "0") });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== Get All Students =====
export const getAllStudents = async (_req, res) => {
  try {
    const students = await StudentMaster.find().lean();
    const classIds = [...new Set(students.map((s) => s.className))];
    const classes = await ClassMaster.find({ classId: { $in: classIds } }).lean();
    const classMap = Object.fromEntries(classes.map((c) => [c.classId, c.className]));

    const enriched = students.map((s) => ({
      ...s,
      classLabel: classMap[s.className] || s.className,
      languages: s.languages || [],
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
};

// ===== Create Student =====
export const createStudent = async (req, res) => {
  try {
    const { admissionType, studentId, ...studentData } = req.body;
    studentData.scholarshipForAdmissionFee = req.body.scholarshipForAdmissionFee || "";
    studentData.scholarshipForSessionFee = req.body.scholarshipForSessionFee || "";
    studentData.remarksOfOtherPhoto = req.body.remarksOfOtherPhoto || "";


// ===== Generate admissionNo (per studentId) =====
let nextAdmissionNo = "AD1";
const lastAdmission = await StudentMaster.find({ studentId })
  .sort({ _id: -1 })
  .limit(1);

if (lastAdmission.length > 0 && lastAdmission[0].admissionNo) {
  const lastNo = parseInt(lastAdmission[0].admissionNo.replace("AD", "")) || 0;
  nextAdmissionNo = "AD" + (lastNo + 1);
}

    let finalStudentId = studentId;

    if (admissionType === "new admission") {
      finalStudentId = await generateNextStudentId();
    } else if (admissionType === "re-admission") {
      if (!finalStudentId) {
        return res.status(400).json({ message: "Student ID is required for re-admission" });
      }
    }

    let rollNo = await generateNextRollNo(req.body.admitClass, req.body.section);
    rollNo = Number(rollNo);

    const newStudent = new StudentMaster({
      admissionNo: nextAdmissionNo,
      admissionType,
      studentId: finalStudentId,
      rollNo,
      admissionDate: req.body.admissionDate || new Date(),
      languages: req.body.languages || [],
      ...studentData,

      fatherPhoto: req.files?.fatherPhoto?.[0]
        ? { data: req.files.fatherPhoto[0].buffer, contentType: req.files.fatherPhoto[0].mimetype }
        : null,
      motherPhoto: req.files?.motherPhoto?.[0]
        ? { data: req.files.motherPhoto[0].buffer, contentType: req.files.motherPhoto[0].mimetype }
        : null,
      childPhoto: req.files?.childPhoto?.[0]
        ? { data: req.files.childPhoto[0].buffer, contentType: req.files.childPhoto[0].mimetype }
        : null,
      otherDocument: req.files?.otherDocument?.[0]
        ? { data: req.files.otherDocument[0].buffer, contentType: req.files.otherDocument[0].mimetype }
        : null,
      idCardPhoto: req.files?.idCardPhoto?.[0]
        ? { data: req.files.idCardPhoto[0].buffer, contentType: req.files.idCardPhoto[0].mimetype }
        : null,
      udisePhoto: req.files?.udisePhoto?.[0]
        ? { data: req.files.udisePhoto[0].buffer, contentType: req.files.udisePhoto[0].mimetype }
        : null,
    });

    await newStudent.save();
    res.status(201).json({ message: "Student saved successfully", student: newStudent });

  } catch (error) {
    console.error("Error saving student:", error);
    res.status(500).json({ message: "Failed to save student", error: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params; // studentId

    const student = await StudentMaster.findOne({ studentId: id });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Update whatsappNo if present
    if (req.body.whatsappNo !== undefined) {
      student.whatsappNo = req.body.whatsappNo;
    }

    // Update allowed fields
    const allowedFields = ["motherTongue", "religion", "ews", "contactNo", "cwsn", "panchayat"];
    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined) student[key] = req.body[key];
    });

    // Update ID Card photo if uploaded
    if (req.files?.idCardPhoto?.length) {
      student.idCardPhoto = {
        data: req.files.idCardPhoto[0].buffer,
        contentType: req.files.idCardPhoto[0].mimetype,
      };
    }

    // Update UDISE photo if uploaded
    if (req.files?.udisePhoto?.length) {
      student.udisePhoto = {
        data: req.files.udisePhoto[0].buffer,
        contentType: req.files.udisePhoto[0].mimetype,
      };
    }

    await student.save();
    res.json({ message: "Student updated successfully", student });
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ error: err.message || "Failed to update student" });
  }
};



export const deleteStudentController = async (req, res) => {
  try {
    const deleted = await StudentMaster.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Get Full Student Info (All merged fields) =====
export const getFullStudentInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await StudentMaster.findOne({ studentId: id }).lean();
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      childInfo: {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        dob: student.dob,
        gender: student.gender,
        admitClass: student.admitClass,
        section: student.section,
        rollNo: student.rollNo,
        bloodGroup: student.bloodGroup,
        height: student.height,
        weight: student.weight,
        nationality: student.nationality,
        languages: student.languages || [],
        permanentAddress: student.permanentAddress || {},
        currentAddress: student.currentAddress || {},
        whatsappNo: student.whatsappNo || "",
        contactNo: student.contactNo || "",
        admissionType: student.admissionType,
        academicSession: student.academicSession,
        admissionDate: student.admissionDate,
        socialCaste: student.socialCaste,
      },
      familyInfo: {
        fatherName: student.fatherName,
        fatherOccupation: student.fatherOccupation,
        fatherPhone: student.fatherPhone,
        fatherEmail: student.fatherEmail,
        fatherNationality: student.fatherNationality,
        fatherQualification: student.fatherQualification,
        motherName: student.motherName,
        motherOccupation: student.motherOccupation,
        motherPhone: student.motherPhone,
        motherEmail: student.motherEmail,
        motherNationality: student.motherNationality,
        motherQualification: student.motherQualification,
        bpl: student.bpl,
        bplNo: student.bplNo,
        familyIncome: student.familyIncome,
      },
      idCardInfo: student.idCardPhoto
        ? {
            studentId: student.studentId,
            studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
            className: student.admitClass,
            dob: student.dob,
            fatherName: student.fatherName,
            motherName: student.motherName,
            contactNo: student.contactNo || student.fatherPhone || "",
            whatsappNo: student.whatsappNo || "",
            permanentAddress: student.permanentAddress || {},
            photo: student.idCardPhoto
  ? `data:${student.idCardPhoto.contentType};base64,${Buffer.from(student.idCardPhoto.data).toString('base64')}`
  : null,

          }
        : {},
      udiseInfo: student.udisePhoto
        ? {
            studentId: student.studentId,
            studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
            dob: student.dob,
            gender: student.gender,
            admitClass: student.admitClass,
            height:student.height,
            weight:student.weight,
            motherTongue: student.motherTongue,
            fatherName: student.fatherName,
            motherName: student.motherName,
            guardianName: student.fatherName || "",
            guardianQualification: student.fatherQualification || "",
            religion: student.religion,
            nationality: student.nationality,
            bpl: student.bpl,
            bplNo: student.bplNo,
            ews: student.ews,
            familyIncome: student.familyIncome,
            contactNo: student.contactNo || "",
            cwsn: student.cwsn || "",
            socialCaste: student.socialCaste,
            panchayat: student.panchayat || "",
            currentAddress: student.currentAddress || {},
            photo: student.udisePhoto
  ? `data:${student.udisePhoto.contentType};base64,${Buffer.from(student.udisePhoto.data).toString('base64')}`
  : null,

          }
        : {},
      extraInfo: {
        motherTongue: student.motherTongue,
        religion: student.religion,
        ews: student.ews,
        cwsn: student.cwsn,
        panchayat: student.panchayat,
      },
    });
  } catch (err) {
    console.error("Error fetching full student info:", err);
    res.status(500).json({ error: err.message || "Failed to fetch full student info" });
  }
};


// ===== Get All Academic Sessions =====
export const getAllAcademicSessions = async (_req, res) => {
  try {
    const sessions = await AcademicSession.find().lean();
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch academic sessions" });
  }
};

// ===== Check if UDISE data exists for a student =====
export const checkUdiseExists = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await StudentMaster.findOne({ studentId }).lean();
    if (!student) return res.status(404).json({ exists: false });

    const exists =
      student.udiseCode ||
      student.udiseSchoolName ||
      student.udisePhoto;

    res.json({
      exists: !!exists,
      udiseData: exists ? student : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to check UDISE data" });
  }
};
export const getStudentByStudentId = async (req, res) => {
  try {
    const studentId = req.params.studentId.toUpperCase(); // convert to uppercase
    const student = await StudentMaster.findOne({ studentId });  // <-- FIXED

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Generate Next Admission Number =====
export const getLatestAdmissionNo = async (req, res) => {
  try {
    const lastStudent = await StudentMaster.findOne().sort({ createdAt: -1 }); // last inserted
    let nextNo = "ADM1";

    if (lastStudent?.admissionNo) {
      const lastNum = parseInt(lastStudent.admissionNo.replace("ADM", "")) + 1;
      nextNo = "ADM" + lastNum; // no padding
    }

    res.json({ admissionNo: nextNo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating admission number" });
  }
};


