// controller/receiptController.js
const Receipt = require("../models/Receipt");
const Student = require("../models/Student");
const User = require("../models/User");

const PREFIX = "RECIEPT"; 
const PAD = 3;            

/**
 * Generate unique next receipt number
 * Always gets the last saved receipt and increments its numeric part
 */
async function generateNextReceiptNo() {
  // Sort by receiptNo numeric value descending
  const last = await Receipt.findOne()
    .sort({ _id: -1 }) // reliably get latest inserted
    .lean();

  const lastNum = last && last.receiptNo
    ? parseInt(last.receiptNo.replace(PREFIX, ""), 10)
    : 0;

  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// GET all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch students" });
  }
};

// GET latest (next) receipt number
exports.getLatestReceiptNo = async (_req, res) => {
  try {
    const receiptNo = await generateNextReceiptNo();
    res.json({ receiptNo });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get next receipt no" });
  }
};

// GET all receipts
exports.getAllReceipts = async (_req, res) => {
  try {
    const receipts = await Receipt.find().lean(); // studentId & userId are strings

    // Map to include names for frontend display
    const data = receipts.map((r) => ({
      ...r,
      student: r.studentName ? { studentId: r.studentId, studentName: r.studentName } : null,
      user: r.username ? { userId: r.userId, username: r.username } : null,
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch receipts" });
  }
};

// POST create receipt
exports.createReceipt = async (req, res) => {
  try {
    const { studentId, date, totalAmount, paymentMode, userId } = req.body;

    if (!studentId || !date || !totalAmount || !paymentMode || !userId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find student and user by custom IDs
    const student = await Student.findOne({ studentId }).lean();
    const user = await User.findOne({ userId }).lean();

    if (!student || !user)
      return res.status(400).json({ error: "Invalid student or user" });

    // Generate unique receiptNo
    const receiptNo = await generateNextReceiptNo();

    const doc = new Receipt({
      receiptNo,
      studentId,
      studentName: student.name,
      date,
      totalAmount,
      paymentMode,
      userId,
      username: user.username,
    });

    await doc.save();
    res.status(201).json(doc);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to create receipt" });
  }
};

// PUT update receipt
exports.updateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    // Prevent overwriting receiptNo
    if (payload.receiptNo) delete payload.receiptNo;

    // Update studentName if studentId changed
    if (payload.studentId) {
      const student = await Student.findOne({ studentId: payload.studentId }).lean();
      if (!student) return res.status(400).json({ error: "Invalid student" });
      payload.studentName = student.name;
    }

    // Update username if userId changed
    if (payload.userId) {
      const user = await User.findOne({ userId: payload.userId }).lean();
      if (!user) return res.status(400).json({ error: "Invalid user" });
      payload.username = user.username;
    }

    const updated = await Receipt.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Receipt not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update receipt" });
  }
};

// DELETE receipt
exports.deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Receipt.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Receipt not found" });

    res.json({ message: "Receipt deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete receipt" });
  }
};
