import StudentMaster from "../models/Student.js";
import ClassMaster from "../models/Class.js";
import AcademicSession from "../models/AcademicSession.js";
import logActivity from "../utils/logActivity.js";


//const PREFIX = "G";
const PAD = 4;
const START_NUM = 2291;

// ===== Generate Next Admission Number =====
async function generateNextAdmissionNo() {
  try {
    const lastStudent = await StudentMaster.aggregate([
      {
        $match: { admissionNo: { $regex: /^ADM\d+$/ } } // only admissionNo like ADM1, ADM2...
      },
      {
        $addFields: {
          num: { $toInt: { $substr: ["$admissionNo", 3, -1] } } // convert number part
        }
      },
      { $sort: { num: -1 } }, // sort descending by number
      { $limit: 1 }
    ]);

    let nextNo = "ADM1";

    if (lastStudent.length > 0) {
      nextNo = "ADM" + (lastStudent[0].num + 1);
    }

    return nextNo;
  } catch (err) {
    console.error("Error generating admission number:", err);
    return "ADM1";
  }
}

async function generateNextStudentId(session) {
  //console.log(" Session received:", session);

  // Dynamically compute prefix from session
  let prefix = '';
  if (session) {
    const startYear = parseInt(session.split("-")[0]);
    if (!isNaN(startYear)) {
      prefix = String.fromCharCode(65 + (startYear - 2019)); // A=2019, B=2020, etc.
    }
  }

  //  Get the latest student globally (any session)
  const latestStudent = await StudentMaster.findOne({})
    .sort({ _id: -1 })
    .select("studentId");

  let nextNum = 2291; // start from 101
  if (latestStudent && latestStudent.studentId) {
    const lastNum = parseInt(latestStudent.studentId.slice(1));
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1; // continue numbering globally
    }
  }

  //  Generate new ID: session prefix + global counter
  const newId = `${prefix}${String(nextNum).padStart(3, "0")}`;
  //console.log(` Generated Registration No for ${session}: ${newId}`);
  return newId;
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
          // Ensure no duplicate MongoDB _id comes from frontend
      if (studentData._id) delete studentData._id;

    studentData.scholarshipForAdmissionFee = req.body.scholarshipForAdmissionFee || "";
    studentData.scholarshipForSessionFee = req.body.scholarshipForSessionFee || "";
    studentData.remarksOfOtherPhoto = req.body.remarksOfOtherPhoto || "";


const nextAdmissionNo = await generateNextAdmissionNo();


    let finalStudentId = studentId;

   if (admissionType === "new admission") {
  finalStudentId = await generateNextStudentId(req.body.academicSession);
}

   else if (admissionType === "re-admission") {
        if (!finalStudentId) {
          return res.status(400).json({ message: "Student ID is required for re-admission" });
        }

        // Check if this student actually exists in the database
        const existingStudent = await StudentMaster.findOne({ studentId: finalStudentId });

        if (!existingStudent) {
          return res.status(400).json({
            message: `Student with ID ${finalStudentId} not found. Readmission allowed only for existing students.`,
          });
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
    
// --- Prepare display version for logs ---
const admissionTypeDisplay = (newStudent.admissionType || "")
  .split(/[-\s]/)                     // split by space or hyphen
  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join(" ");                          // join with space

await logActivity(
  `Added Student: ${newStudent.firstName} ${newStudent.lastName} | ${newStudent.admitClass} | Section: ${newStudent.section} | Roll No: ${newStudent.rollNo} | ${admissionTypeDisplay}`
);



    res.status(201).json({ message: "Student saved successfully", student: newStudent });

  } catch (error) {
    console.error("Error saving student:", error);
    res.status(500).json({ message: "Failed to save student", error: error.message });
  }
};



export const updateStudent = async (req, res) => {
  try {
    const admissionNo = req.params.admissionNo.toUpperCase().trim(); // find using Admission No
    const student = await StudentMaster.findOne({ admissionNo });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // --- Step 1: Clean null/undefined photo fields ---
    const photoFields = [
      "fatherPhoto",
      "motherPhoto",
      "childPhoto",
      "otherDocument",
      "idCardPhoto",
      "udisePhoto",
    ];

    // remove invalid photo fields (avoid casting error)
    photoFields.forEach((field) => {
      const val = req.body[field];
      if (val === null || val === "null" || val === undefined || val === "") {
        delete req.body[field];
      }
    });

    // --- Step 2: Dynamically update other fields ---
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        student[key] = req.body[key];
      }
    });

    // --- Step 3: Handle uploaded photos (if new ones provided) ---
    photoFields.forEach((field) => {
      if (req.files?.[field]?.length) {
        student[field] = {
          data: req.files[field][0].buffer,
          contentType: req.files[field][0].mimetype,
        };
      }
    });

    // --- Step 4: Save updated record ---
    await student.save({ validateBeforeSave: false });
    await logActivity(`Updated Student: ${student.firstName} ${student.lastName} (${student.studentId})`);
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
    await logActivity(`Deleted Student: ${deleted.firstName} ${deleted.lastName} (${deleted.studentId})`);
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
    const studentArr = await StudentMaster.find({ studentId: id.toUpperCase().trim() })
      .sort({ _id: -1 })
      .limit(1)
      .lean();

    if (!studentArr.length) return res.status(404).json({ error: "Student not found" });

    const student = studentArr[0];

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
    const studentArr = await StudentMaster.find({ studentId: req.params.studentId.toUpperCase() })
      .sort({ _id: -1 })
      .limit(1)
      .lean();

    if (!studentArr.length) return res.status(404).json({ message: "Student not found" });

    res.json(studentArr[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};




export const getLatestAdmissionNo = async (req, res) => {
  try {
    const lastStudent = await StudentMaster.aggregate([
      { $match: { admissionNo: { $regex: /^ADM\d+$/ } } },
      { $addFields: { num: { $toInt: { $substr: ["$admissionNo", 3, -1] } } } },
      { $sort: { num: -1 } },
      { $limit: 1 },
    ]);

    let nextNo = "ADM1"; // default

    if (lastStudent.length > 0) {
      const nextNum = lastStudent[0].num + 1;
      nextNo = "ADM" + String(nextNum);
    }

    res.json({ admissionNo: nextNo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating admission number" });
  }
};

export const getLatestStudentByStudentId = async (req, res) => {
  try {
    const studentArr = await StudentMaster.find({ studentId: req.params.studentId.toUpperCase() })
      .sort({ _id: -1 })
      .limit(1)
      .lean();

    if (!studentArr.length) return res.status(404).json({ message: "Student not found" });

    res.json(studentArr[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const getLatestStudentBySession = async (req, res) => {
  try {
    const { session } = req.params;
    //console.log(" Incoming session from frontend:", session);

    const newId = await generateNextStudentId(session);
    res.json({ studentId: newId });
  } catch (error) {
    console.error("Error fetching latest student ID by session:", error);
    res.status(500).json({ message: "Failed to generate ID" });
  }
};

