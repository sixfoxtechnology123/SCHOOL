// controllers/feeStructureController.js
const FeeStructure = require("../models/FeeStructure");

const PREFIX = "FEES";
const PAD = 3; // FEES001, FEES002

// Generate next FeeStructID
async function generateNextFeeStructId() {
  const last = await FeeStructure.findOne().sort({ feeStructId: -1 }).lean();
  if (!last || !last.feeStructId) return `${PREFIX}${String(1).padStart(PAD, "0")}`;

  const lastNum = parseInt(last.feeStructId.replace(PREFIX, ""), 10) || 0;
  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// Get latest FeeStructID
exports.getLatestFeeStructId = async (_req, res) => {
  try {
    const nextId = await generateNextFeeStructId();
    res.json({ feeStructId: nextId });
  } catch (err) {
    res.status(500).json({ error: "Failed to get next FeeStructID" });
  }
};

// Get all Fee Structures
exports.getAllFeeStructures = async (_req, res) => {
  try {
    const list = await FeeStructure.find().lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fee structures" });
  }
};

// Create Fee Structure
exports.createFeeStructure = async (req, res) => {
  try {
    const { classId, feeHeadId, amount } = req.body;
    if (!classId || !feeHeadId || !amount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const feeStructId = await generateNextFeeStructId();
    const doc = new FeeStructure({ feeStructId, classId, feeHeadId, amount });
    await doc.save();

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: "Failed to create Fee Structure" });
  }
};

// Update Fee Structure
exports.updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.feeStructId) delete payload.feeStructId; // Prevent ID change

    const updated = await FeeStructure.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Fee Structure not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update Fee Structure" });
  }
};

// Delete Fee Structure
exports.deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FeeStructure.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Fee Structure not found" });

    res.json({ message: "Fee Structure deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete Fee Structure" });
  }
};
