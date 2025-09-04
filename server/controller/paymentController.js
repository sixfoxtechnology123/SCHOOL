const Payment = require("../models/Payment");
const Student = require("../models/Student");

const PREFIX = "RECEIPT";
const PAD = 3; // PAY001, PAY002...

// Generate next PaymentId based on last payment
async function generateNextPaymentId() {
  const last = await Payment.findOne().sort({ paymentId: -1 }).lean(); //  sort by paymentId
  const lastNum = last ? parseInt(last.paymentId.replace(PREFIX, ""), 10) : 0;
  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
};

exports.getLatestPaymentId = async (_req, res) => {
  try {
    const nextId = await generateNextPaymentId();
    res.json({ paymentId: nextId });
  } catch (err) {
    console.error("Error generating paymentId:", err);
    res.status(500).json({ error: "Failed to get paymentId" });
  }
};

exports.getAllPayments = async (_req, res) => {
  try {
    const payments = await Payment.find().lean();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch payments" });
  }
};

exports.createPayment = async (req, res) => {
  try {
    if (!req.body.paymentId) {
      req.body.paymentId = await generateNextPaymentId();
    }

    const payment = new Payment(req.body);
    await payment.save();

    res.status(201).json(payment);
  } catch (err) {
    console.error("Save error:", err.message);
    res.status(500).json({ error: err.message || "Failed to create payment" });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Payment not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update payment" });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Payment not found" });
    res.json({ message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete payment" });
  }
};
