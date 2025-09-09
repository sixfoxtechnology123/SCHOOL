// ======= server/controllers/paymentController.js =======
const Payment = require("../models/Payment");
const Student = require("../models/Student");
const FeeStructure = require("../models/FeeStructure");
const FeeHead = require("../models/FeeHead");
const ClassMaster = require("../models/Class");

const PREFIX = "RECEIPT";
const PAD = 3; // RECEIPT001, RECEIPT002...

// Generate next PaymentId
async function generateNextPaymentId() {
  const last = await Payment.findOne().sort({ paymentId: -1 }).lean();
  const lastNum = last ? parseInt(last.paymentId.replace(PREFIX, ""), 10) : 0;
  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// ================== Student Routes ==================
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select("_id studentName name rollNo studentId className section")
      .lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
};

const getAllClasses = async (_req, res) => {
  try {
    const classDocs = await ClassMaster.find().select("className").lean();
    if (classDocs && classDocs.length) {
      const classes = Array.from(new Set(classDocs.map((c) => c.className)));
      return res.json(classes);
    }
    const classes = await Student.distinct("className");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch classes" });
  }
};

const getSectionsByClass = async (req, res) => {
  try {
    const { className } = req.query;
    if (className) {
      const sections = await Student.distinct("section", { className });
      return res.json(sections);
    }
    const pairs = await Student.aggregate([
      { $group: { _id: { className: "$className", section: "$section" } } },
      { $project: { _id: 0, className: "$_id.className", sectionName: "$_id.section" } },
    ]);
    res.json(pairs);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch sections" });
  }
};

const getStudentsByClassAndSection = async (req, res) => {
  try {
    const { className, section } = req.query;
    if (!className || !section)
      return res.status(400).json({ error: "className and section required" });
    const students = await Student.find({ className, section })
      .select("_id studentName name rollNo studentId className section")
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
    const { className, feeHeadName, routeId } = req.query;
    if (!className || !feeHeadName)
      return res.status(400).json({ message: "className and feeHeadName required" });

    const classData = await ClassMaster.findOne({ className }).lean();
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

// ================== Helper: populate fee amounts ==================
async function populateFeeAmounts(paymentBody) {
  if (!paymentBody.feeDetails || !Array.isArray(paymentBody.feeDetails)) return;

  let classId = paymentBody.classId;
  if (!classId && paymentBody.className) {
    const classData = await ClassMaster.findOne({ className: paymentBody.className }).lean();
    if (classData) classId = classData.classId;
  }

  const classStructures = await FeeStructure.find({ classId }).lean();
  const globalHeads = await FeeHead.find().lean();

  paymentBody.feeDetails = await Promise.all(
    paymentBody.feeDetails.map(async (f) => {
      let feeHeadId = f.feeHeadId;
      if (!feeHeadId && f.feeHead) {
        const headData = await FeeHead.findOne({ feeHeadName: f.feeHead }).lean();
        if (headData) feeHeadId = headData.feeHeadId;
      }

      let amount = 0;
      if (f.feeHead && f.feeHead.toLowerCase() === "transport" && f.routeId) {
        const routeData = await FeeStructure.findOne({ classId, feeHeadId, routeId: f.routeId }).lean();
        amount = routeData ? routeData.amount : 0;
      } else {
        const headData = classStructures.find((h) => h.feeHeadId === feeHeadId);
        amount = headData ? headData.amount : (globalHeads.find((h) => h.feeHeadId === feeHeadId)?.amount || 0);
      }

      return {
        ...f,
        feeHeadId,
        amount,
        distance: typeof f.distance !== "undefined" ? f.distance : "", // <-- stores exact frontend value
      };
    })
  );

  paymentBody.totalAmount = paymentBody.feeDetails.reduce((sum, f) => sum + Number(f.amount || 0), 0);
}

// ================== Create Payment ==================
const createPayment = async (req, res) => {
  try {
    if (!req.body.paymentId) req.body.paymentId = await generateNextPaymentId();

    const existing = await Payment.findOne({
      className: req.body.className,
      section: req.body.section,
      rollNo: req.body.rollNo,
    });
    if (existing) {
      return res.status(400).json({
        error: `Receipt already exists for Class: ${req.body.className}, Section: ${req.body.section}, Roll No: ${req.body.rollNo}`,
      });
    }

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

    const existing = await Payment.findOne({
      className: updateBody.className,
      section: updateBody.section,
      rollNo: updateBody.rollNo,
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res.status(400).json({
        error: `Receipt already exists for Class: ${updateBody.className}, Section: ${updateBody.section}, Roll No: ${updateBody.rollNo}`,
      });
    }

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
};
