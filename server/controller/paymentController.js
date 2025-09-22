// ======= server/controllers/paymentController.js =======
const Payment = require("../models/Payment");
const Student = require("../models/Student");
const FeeStructure = require("../models/FeeStructure");
const FeeHead = require("../models/FeeHead");
const ClassMaster = require("../models/Class");

const PREFIX = "RECEIPT";
const PAD = 5; // RECEIPT001, RECEIPT002...

// ================== Helper: Generate next PaymentId ==================
async function generateNextPaymentId() {
  const last = await Payment.findOne().sort({ paymentId: -1 }).lean();
  const lastNum = last ? parseInt(last.paymentId.replace(PREFIX, ""), 10) : 0;
  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// ================== Student Routes ==================
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
};

const getAllClasses = async (_req, res) => {
  try {
    const classDocs = await ClassMaster.find().select("className").lean();
    const classes = Array.from(new Set(classDocs.map((c) => c.className)));
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch classes" });
  }
};

// ================== Get Sections by Class ==================
const getSectionsByClass = async (req, res) => {
  try {
    const { className } = req.query;

    if (className) {
      const classDocs = await ClassMaster.find({ className }).select("section className -_id").lean();
      const sections = classDocs.map((c) => ({ className: c.className, section: c.section }));
      return res.json(sections);
    } else {
      const classDocs = await ClassMaster.find().select("className section -_id").lean();
      const uniquePairs = classDocs.map((c) => ({ className: c.className, section: c.section }));
      return res.json(uniquePairs);
    }
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch sections" });
  }
};

const getStudentsByClassAndSection = async (req, res) => {
  try {
    const { className, section } = req.query;
    if (!className || !section)
      return res.status(400).json({ error: "className and section required" });

    const students = await Student.find({ admitClass: className, section })
      .select("_id firstName lastName studentName rollNo studentId admitClass section academicSession distanceFromSchool transportRequired")
      .lean();

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
};

// ================== Payment Routes ==================
const getAllPayments = async (_req, res) => {
  try {
    const payments = await Payment.find().lean();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch payments" });
  }
};

const getLatestPaymentId = async (_req, res) => {
  try {
    const nextId = await generateNextPaymentId();
    res.json({ paymentId: nextId });
  } catch (err) {
    res.status(500).json({ error: "Failed to get paymentId" });
  }
};

// ================== Helper: Parse distance range ==================
function parseDistanceRange(distanceStr) {
  if (!distanceStr) return { min: 0, max: 0 };
  const cleaned = distanceStr.replace(/[a-zA-Z]/g, "").trim(); // remove letters
  let min = 0, max = 0;
  if (cleaned.includes("-")) {
    const [start, end] = cleaned.split("-");
    min = parseInt(start.trim());
    max = parseInt(end.trim());
  } else {
    min = parseInt(cleaned);
    max = min;
  }
  return { min, max };
}

// ================== Helper: Populate Fee Amounts ==================
async function populateFeeAmounts(paymentBody) {
  if (!Array.isArray(paymentBody.feeDetails)) {
    try {
      paymentBody.feeDetails = JSON.parse(paymentBody.feeDetails);
    } catch (err) {
      paymentBody.feeDetails = [];
    }
  }

  paymentBody.date = paymentBody.date ? new Date(paymentBody.date) : new Date();

  let studentDoc = null;
  if (paymentBody.student) {
    studentDoc = await Student.findOne({ studentId: paymentBody.student }).lean();
    if (!studentDoc) studentDoc = await Student.findById(paymentBody.student).lean();

    if (studentDoc) {
      paymentBody.student = studentDoc.studentId;
      paymentBody.studentName = `${studentDoc.firstName || ""} ${studentDoc.lastName || ""}`.trim();
      paymentBody.admitClass = studentDoc.admitClass;
      paymentBody.section = studentDoc.section;
      paymentBody.rollNo = studentDoc.rollNo;
      paymentBody.academicSession = studentDoc.academicSession;
    }
  }

  let classId = paymentBody.classId;
  if (!classId && paymentBody.admitClass) {
    const classData = await ClassMaster.findOne({ className: paymentBody.admitClass }).lean();
    if (classData) classId = classData.classId;
  }

  const classStructures = await FeeStructure.find({
    classId,
    academicSession: paymentBody.academicSession
  }).lean();
  const feeHeads = await FeeHead.find().lean();

  let total = 0;
  const finalFeeDetails = await Promise.all(
    paymentBody.feeDetails.map(async (f) => {
      let amount = 0;
      const feeHeadData = feeHeads.find(h => h.feeHeadName === f.feeHead);
      if (!feeHeadData) return { ...f, amount: 0 };

      // ====== TRANSPORT AUTO-FILL LOGIC ======
      if (f.feeHead.toLowerCase() === "transport") {
        if ((!f.routeId || f.routeId === "") && studentDoc?.distanceFromSchool && studentDoc.transportRequired === "Yes") {
          const routes = classStructures.filter(cs => cs.feeHeadId === feeHeadData.feeHeadId);
          const km = Number(studentDoc.distanceFromSchool);

          const autoRoute = routes.find(r => {
            const { min, max } = parseDistanceRange(r.distance);
            return km >= min && km <= max;
          });

          if (autoRoute) {
            f.routeId = autoRoute.routeId;
            f.distance = autoRoute.distance;
          }
        }

        if (f.routeId) {
          const routeFee = classStructures.find(
            cs => cs.feeHeadId === feeHeadData.feeHeadId && cs.routeId === f.routeId
          );
          amount = routeFee ? Number(routeFee.amount) : Number(f.amount || 0);
        } else {
          amount = Number(f.amount || 0);
        }
      } else {
        // Non-transport fee
        const feeData = classStructures.find(cs => cs.feeHeadId === feeHeadData.feeHeadId);
        amount = feeData ? Number(feeData.amount) : Number(f.amount || 0);
      }

      total += amount;
      return { ...f, amount };
    })
  );

  paymentBody.feeDetails = finalFeeDetails;
  paymentBody.currentFee = total;

  let previousPending = 0;
  if (studentDoc) {
    const lastPayment = await Payment.findOne({ student: studentDoc.studentId })
      .sort({ date: -1, _id: -1 })
      .lean();
    previousPending = lastPayment ? Number(lastPayment.pendingAmount || 0) : 0;
  }

  paymentBody.discount = Number(paymentBody.discount || 0);
  paymentBody.totalAmount = total + previousPending;
  paymentBody.netPayable = Math.max(paymentBody.totalAmount - paymentBody.discount, 0);
  paymentBody.previousPending = previousPending;

  if (paymentBody.paymentStatus === "Full Payment") {
    paymentBody.amountPaid = paymentBody.netPayable;
    paymentBody.pendingAmount = 0;
  } else {
    paymentBody.amountPaid = Number(paymentBody.amountPaid || 0);
    paymentBody.pendingAmount = Math.max(paymentBody.netPayable - paymentBody.amountPaid, 0);
  }

  paymentBody.paymentStatus = paymentBody.pendingAmount > 0 ? "Pending" : "Full Payment";
}

// ================== Create Payment ==================
const createPayment = async (req, res) => {
  try {
    if (!req.body.paymentId) req.body.paymentId = await generateNextPaymentId();
    await populateFeeAmounts(req.body);

    const payment = new Payment(req.body);
    await payment.save();

    res.status(201).json(payment);
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ error: err.message || "Failed to create payment" });
  }
};

// ================== Update Payment ==================
const updatePayment = async (req, res) => {
  try {
    const updateBody = { ...req.body };
    await populateFeeAmounts(updateBody);

    const paymentDoc = await Payment.findById(req.params.id);
    if (!paymentDoc) return res.status(404).json({ error: "Payment not found" });

    Object.keys(updateBody).forEach((key) => {
      paymentDoc[key] = updateBody[key];
    });

    await paymentDoc.save();
    res.json(paymentDoc);
  } catch (err) {
    console.error("Update payment error:", err);
    res.status(500).json({ error: err.message || "Failed to update payment" });
  }
};

// ================== Duplicate Payment Check ==================
const checkDuplicatePayment = async (req, res) => {
  try {
    const { studentId, month, year } = req.query;
    const existingPayment = await Payment.findOne({ student: studentId, month, year });
    res.status(200).json({ duplicate: !!existingPayment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== Delete Payment ==================
const deletePayment = async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Payment not found" });
    res.json({ message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete payment" });
  }
};

// ================== Get Previous Pending ==================
const getPreviousPending = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(400).json({ error: "studentId required" });

    let studentDoc = null;
    if (studentId.match(/^[0-9a-fA-F]{24}$/)) {
      studentDoc = await Student.findById(studentId).lean();
    } else {
      studentDoc = await Student.findOne({ studentId }).lean();
    }

    if (!studentDoc) return res.status(404).json({ error: "Student not found" });

    const lastPayment = await Payment.findOne({ student: studentDoc.studentId })
      .sort({ date: -1, _id: -1 })
      .lean();
    const previousPending = lastPayment ? Number(lastPayment.pendingAmount || 0) : 0;

    return res.json({ studentId: studentDoc.studentId, previousPending });
  } catch (err) {
    console.error("Error fetching previous pending:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch previous pending" });
  }
};

// ================== Get Fee Amount ==================
const getFeeAmount = async (req, res) => {
  try {
    const { className, admitClass, feeHeadName, routeId } = req.query;
    const classToUse = admitClass || className;

    if (!classToUse || !feeHeadName) {
      return res.status(400).json({ message: "className/admitClass and feeHeadName required" });
    }

    const classData = await ClassMaster.findOne({ className: classToUse }).lean();
    if (!classData) return res.json({ amount: 0 });

    const feeHeadData = await FeeHead.findOne({ feeHeadName }).lean();
    if (!feeHeadData) return res.json({ amount: 0 });

    if (feeHeadName.toLowerCase() === "transport" && routeId) {
      const routeData = await FeeStructure.findOne({
        classId: classData.classId,
        feeHeadId: feeHeadData.feeHeadId,
        routeId,
      }).lean();
      return res.json({ amount: routeData ? routeData.amount : 0 });
    }

    const fee = await FeeStructure.findOne({
      classId: classData.classId,
      feeHeadId: feeHeadData.feeHeadId,
    }).lean();

    res.json({ amount: fee ? fee.amount : 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ====== Get all Fee Heads Amount for Class + Academic Session ======
const getClassFeeStructure = async (req, res) => {
  try {
    const { className, academicSession, distance } = req.query;

    if (!className || !academicSession) {
      return res.status(400).json({ message: "className and academicSession required" });
    }

    let query = { className, academicSession };
    let feeStructs = await FeeStructure.find(query).lean();

    if (distance) {
      const dist = Number(distance);
      feeStructs = feeStructs.filter(f => {
        if (f.feeHeadName !== "Transport" || !f.distance) return true;
        const { min, max } = parseDistanceRange(f.distance);
        return dist >= min && dist <= max;
      });
    }

    res.json(feeStructs);
  } catch (err) {
    console.error("Error fetching class fee structure:", err);
    res.status(500).json({ message: "Error fetching fee structure" });
  }
};

// ====== New: Get Fee Structure By ClassId & AcademicSession ======
const getFeeStructureByClassAndSession = async (req, res) => {
  try {
    const { classId, academicSession } = req.query;

    if (!classId || !academicSession) {
      return res.status(400).json({ message: "classId and academicSession required" });
    }

    const feeStructures = await FeeStructure.find({
      classId,
      academicSession,
    }).select("feeHeadId feeHeadName amount distance");

    res.json(feeStructures);
  } catch (err) {
    res.status(500).json({ message: "Error fetching fee structure", error: err.message });
  }
};

// ================== Export All ==================
module.exports = {
  getAllPayments,
  getLatestPaymentId,
  createPayment,
  updatePayment,
  deletePayment,
  getAllStudents,
  getFeeAmount,
  getSectionsByClass,
  getStudentsByClassAndSection,
  getAllClasses,
  checkDuplicatePayment,
  getPreviousPending,
  getClassFeeStructure,
  getFeeStructureByClassAndSession,
};
