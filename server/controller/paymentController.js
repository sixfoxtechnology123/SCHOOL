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

// ================== Helper: Populate Fee Amounts ==================
async function populateFeeAmounts(paymentBody) {
  if (!Array.isArray(paymentBody.feeDetails)) {
    try {
      paymentBody.feeDetails = JSON.parse(paymentBody.feeDetails);
    } catch (err) {
      paymentBody.feeDetails = [];
    }
  }

  //  Ensure date is stored as Date type
  if (paymentBody.date) {
    paymentBody.date = new Date(paymentBody.date);
  } else {
    paymentBody.date = new Date();
  }

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
    }
  }

  let classId = paymentBody.classId;
  if (!classId && paymentBody.admitClass) {
    const classData = await ClassMaster.findOne({ className: paymentBody.admitClass }).lean();
    if (classData) classId = classData.classId;
  }

  const classStructures = await FeeStructure.find({ classId }).lean();
  const feeHeads = await FeeHead.find().lean();

  let total = 0;
  const finalFeeDetails = await Promise.all(
    paymentBody.feeDetails.map(async (f) => {
      let amount = 0;
      const feeHeadData = feeHeads.find(h => h.feeHeadName === f.feeHead);

      if (!feeHeadData) return { ...f, amount: 0 };

      if (f.feeHead.toLowerCase() === "transport") {
        if ((!f.routeId || f.routeId === "") && studentDoc?.distanceFromSchool && studentDoc.transportRequired === "Yes") {
          const routes = await FeeStructure.find({ classId, feeHeadId: feeHeadData.feeHeadId }).lean();
          const km = Number(studentDoc.distanceFromSchool);

          const autoRoute = routes.find(r => {
            const cleaned = r.label.replace("KM", "").trim();
            const [min, max] = cleaned.split("-").map(n => parseInt(n.trim()));
            return km >= min && km <= max;
          });

          if (autoRoute) {
            f.routeId = autoRoute.routeId;
            f.distance = autoRoute.label;
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
        const feeStructure = classStructures.find(cs => cs.feeHeadId === feeHeadData.feeHeadId);
        amount = feeStructure ? Number(feeStructure.amount) : Number(f.amount || 0);
      }

      total += amount;
      return { ...f, amount };
    })
  );

  paymentBody.feeDetails = finalFeeDetails;
  paymentBody.currentFee = total;

  // --- Get previous pending from last receipt only ---
  let previousPending = 0;
  if (studentDoc) {
    const lastPayment = await Payment.findOne({ student: studentDoc.studentId })
      .sort({ date: -1, _id: -1 }) //  FIXED
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

  // console.log(" Final Payment Debug:", {
  //   student: paymentBody.student,
  //   currentFee: paymentBody.currentFee,
  //   previousPending: paymentBody.previousPending,
  //   totalAmount: paymentBody.totalAmount,
  //   discount: paymentBody.discount,
  //   netPayable: paymentBody.netPayable,
  //   amountPaid: paymentBody.amountPaid,
  //   pendingAmount: paymentBody.pendingAmount,
  // });
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

// ================== Get Previous Pending and All Payments ==================
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

    const payments = await Payment.find({ student: studentDoc.studentId }).lean();

    const lastPayment = await Payment.findOne({ student: studentDoc.studentId })
      .sort({ date: -1, _id: -1 }) //  FIXED
      .lean();
    const previousPending = lastPayment ? Number(lastPayment.pendingAmount || 0) : 0;

    // console.log(`Previous pending for student ${studentDoc.studentId}: ${previousPending}`);
    // console.log("All payments for this student:", payments);

    return res.json({ studentId: studentDoc.studentId, previousPending, payments });
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
};
