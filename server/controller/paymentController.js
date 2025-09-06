// controllers/paymentController.js
const Payment = require("../models/Payment");
const Student = require("../models/Student");
const FeeStructure = require("../models/FeeStructure");
const FeeHead = require("../models/FeeHead");
const ClassMaster = require("../models/Class"); // Added

const PREFIX = "RECEIPT";
const PAD = 3; // RECEIPT001, RECEIPT002...

// Generate next PaymentId
async function generateNextPaymentId() {
  const last = await Payment.findOne().sort({ paymentId: -1 }).lean();
  const lastNum = last ? parseInt(last.paymentId.replace(PREFIX, ""), 10) : 0;
  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
};

// Get latest PaymentId
exports.getLatestPaymentId = async (_req, res) => {
  try {
    const nextId = await generateNextPaymentId();
    res.json({ paymentId: nextId });
  } catch (err) {
    console.error("Error generating paymentId:", err);
    res.status(500).json({ error: "Failed to get paymentId" });
  }
};

// Get all payments
exports.getAllPayments = async (_req, res) => {
  try {
    const payments = await Payment.find().lean();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch payments" });
  }
};

// Get fee amount by className + feeHeadName
exports.getFeeAmount = async (req, res) => {
  try {
    const { className, feeHeadName } = req.query;
    if (!className || !feeHeadName) {
      return res.status(400).json({ message: "className and feeHeadName required" });
    }

    // Find classId from className
    const classData = await ClassMaster.findOne({ className }).lean();
    if (!classData) return res.json({ amount: 0 });

    // Find feeHeadId from feeHeadName
    const feeHeadData = await FeeHead.findOne({ feeHeadName }).lean();
    if (!feeHeadData) return res.json({ amount: 0 });

    // Find fee amount
    const fee = await FeeStructure.findOne({
      classId: classData.classId,
      feeHeadId: feeHeadData.feeHeadId,
    }).lean();

    const amount = fee ? fee.amount : 0;
    res.json({ amount });
  } catch (err) {
    console.error("getFeeAmount error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Auto-populate fee amounts before saving
async function populateFeeAmounts(paymentBody) {
  if (!paymentBody.feeDetails || !Array.isArray(paymentBody.feeDetails)) return;

  // Convert className to classId if needed
  let classId = paymentBody.classId;
  if (!classId && paymentBody.className) {
    const classData = await ClassMaster.findOne({ className: paymentBody.className }).lean();
    if (classData) classId = classData.classId;
  }

  // Load all fee structures for this class
  const classStructures = await FeeStructure.find({ classId }).lean();
  const globalHeads = await FeeHead.find().lean();

  paymentBody.feeDetails = await Promise.all(
    paymentBody.feeDetails.map(async (f) => {
      let feeHeadId = f.feeHeadId;

      // Convert feeHeadName to feeHeadId if needed
      if (!feeHeadId && f.feeHead) {
        const headData = await FeeHead.findOne({ feeHeadName: f.feeHead }).lean();
        if (headData) feeHeadId = headData.feeHeadId;
      }

      let amount = 0;

      // 1. From class fee structure
      const headData = classStructures.find((h) => h.feeHeadId === feeHeadId);
      if (headData) amount = headData.amount;

      // 2. From global fee head (fallback)
      if (!amount) {
        const globalHead = globalHeads.find((h) => h.feeHeadId === feeHeadId);
        if (globalHead) amount = globalHead.amount || 0;
      }

      return { ...f, feeHeadId, amount };
    })
  );

  // Recalculate total
  paymentBody.totalAmount = paymentBody.feeDetails.reduce(
    (sum, f) => sum + Number(f.amount || 0),
    0
  );
}

// Create payment
exports.createPayment = async (req, res) => {
  try {
    if (!req.body.paymentId) {
      req.body.paymentId = await generateNextPaymentId();
    }

    await populateFeeAmounts(req.body);

    const payment = new Payment(req.body);
    await payment.save();

    res.status(201).json(payment);
  } catch (err) {
    console.error("Save error:", err.message);
    res.status(500).json({ error: err.message || "Failed to create payment" });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const updateBody = { ...req.body };

    await populateFeeAmounts(updateBody);

    const updated = await Payment.findByIdAndUpdate(req.params.id, updateBody, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Payment not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update payment" });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Payment not found" });
    res.json({ message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete payment" });
  }
};
