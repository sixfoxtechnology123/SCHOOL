// ======= server/controllers/paymentController.js =======
const Payment = require("../models/Payment");
const Student = require("../models/Student");
const FeeStructure = require("../models/FeeStructure");
const FeeHead = require("../models/FeeHead");
const ClassMaster = require("../models/Class");

const PREFIX = "RECEIPT";
const PAD = 3; // RECEIPT001, RECEIPT002...

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

const getSectionsByClass = async (req, res) => {
  try {
    const { className } = req.query;
    if (className) {
      const sections = await Student.distinct("section", { admitClass: className });
      return res.json(sections.map((s) => ({ className, section: s })));
    } else {
      const pairs = await Student.aggregate([
        { $group: { _id: { className: "$admitClass", section: "$section" } } },
        { $project: { _id: 0, className: "$_id.className", section: "$_id.section" } },
      ]);
      res.json(pairs);
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
      .select("_id firstName lastName studentName rollNo studentId admitClass section")
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

// ================== Helper: Populate fee amounts, studentId, previous pending, and new fields ==================
async function populateFeeAmounts(paymentBody) {
  if (!paymentBody.feeDetails || !Array.isArray(paymentBody.feeDetails)) return;

  // --- Fetch student ---
  let studentDoc = null;
  if (paymentBody.student) {
    studentDoc = await Student.findOne({ studentId: paymentBody.student }).lean();
    if (!studentDoc) {
      studentDoc = await Student.findById(paymentBody.student).lean();
    }

    if (studentDoc) {
      paymentBody.student = studentDoc.studentId;
      paymentBody.studentName = `${studentDoc.firstName || ""} ${studentDoc.lastName || ""}`.trim();
      paymentBody.admitClass = studentDoc.admitClass;
      paymentBody.section = studentDoc.section;
      paymentBody.rollNo = studentDoc.rollNo;
    }
  }

  // --- Fetch classId ---
  let classId = paymentBody.classId;
  if (!classId && paymentBody.className) {
    const classData = await ClassMaster.findOne({ className: paymentBody.className }).lean();
    if (classData) classId = classData.classId;
  }

  const classStructures = await FeeStructure.find({ classId }).lean();
  const globalHeads = await FeeHead.find().lean();

  // --- Populate fee amounts ---
  let total = 0;
  for (let f of paymentBody.feeDetails) {
    const feeHeadData = globalHeads.find(h => h.feeHeadName === f.feeHead);
    let amount = f.amount ? Number(f.amount) : 0;

    if (feeHeadData) {
      if (f.feeHead.toLowerCase() === "transport" && f.routeId) {
        const routeFee = classStructures.find(
          cs => cs.feeHeadId === feeHeadData.feeHeadId && cs.routeId === f.routeId
        );
        amount = routeFee ? Number(routeFee.amount) : amount;
      } else {
        const classFee = classStructures.find(cs => cs.feeHeadId === feeHeadData.feeHeadId);
        amount = classFee ? Number(classFee.amount) : amount;
      }
    }

    f.amount = amount;
    f.distance = f.distance || "";
    total += amount;
  }

  // --- Current fee (before discounts) ---
  paymentBody.currentFee = total;

  // --- Apply discount if present ---
  paymentBody.discount = paymentBody.discount ? Number(paymentBody.discount) : 0;

  // --- Net payable amount after discount ---
  paymentBody.netPayable = Math.max(total - paymentBody.discount, 0);

  // --- Amount paid ---
  if (!paymentBody.amountPaid) {
    paymentBody.amountPaid = paymentBody.paymentStatus === "Full Payment" ? total : 0;
  }

  // --- Previous pending ---
  let previousPending = 0;
  if (studentDoc) {
    const previousPayments = await Payment.find({ student: studentDoc.studentId }).lean();
    previousPending = previousPayments.reduce((sum, p) => {
      const totalAmt = Number(p.totalAmount || 0);
      const paid = Number(p.amountPaid || 0);
      return sum + (totalAmt - paid);
    }, 0);
  }

  // --- Final Totals ---
  paymentBody.totalAmount = total;
  paymentBody.previousPending = previousPending;
  paymentBody.pendingAmount = Math.max(total + previousPending - (paymentBody.amountPaid || 0), 0);
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
};
