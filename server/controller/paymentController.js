// controllers/paymentController.js
const Payment = require("../models/Payment");
const FeeHead = require("../models/FeeHead");

const PREFIX = "Payment";
const PAD = 3; // Payment001, Payment002

// Generate next Payment ID
async function generateNextPaymentId() {
  const last = await Payment.findOne().sort({ paymentId: -1 }).lean();
  if (!last || !last.paymentId) return `${PREFIX}${String(1).padStart(PAD, "0")}`;

  const lastNum = parseInt(last.paymentId.replace(PREFIX, ""), 10) || 0;
  return `${PREFIX}${String(lastNum + 1).padStart(PAD, "0")}`;
}

//  GET all payments (with feeHeadName instead of only feeHeadId)
exports.getAllPayments = async (_req, res) => {
  try {
    const payments = await Payment.find().lean();

    // Get all fee heads
    const feeHeads = await FeeHead.find().lean();
    const feeHeadMap = feeHeads.reduce((acc, fh) => {
      acc[fh.feeHeadId] = fh.feeHeadName;
      return acc;
    }, {});

    // Attach feeHeadName
    const result = payments.map(p => ({
      ...p,
      feeHeadName: feeHeadMap[p.feeHeadId] || p.feeHeadId,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payments", error: err.message });
  }
};

// GET latest PaymentID
exports.getLatestPaymentId = async (_req, res) => {
  try {
    const nextId = await generateNextPaymentId();
    res.json({ paymentId: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create payment
exports.createPayment = async (req, res) => {
  try {
    const { receiptNo, feeHeadId, amount } = req.body;
    if (!receiptNo || !feeHeadId || !amount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const paymentId = await generateNextPaymentId();
    const doc = new Payment({ paymentId, receiptNo, feeHeadId, amount });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  PUT update payment
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.paymentId) delete payload.paymentId;

    const updated = await Payment.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Payment not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Payment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Payment not found" });

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
