// controllers/feeHeadController.js
const mongoose = require("mongoose");
const FeeHead = require("../models/FeeHead");
const logActivity = require("../utils/logActivity");

const PREFIX = "F";
const PAD = 2; // F01, F02, etc.

// Generate next FeeHead ID
async function generateNextFeeHeadId() {
  const last = await FeeHead.findOne().sort({ feeHeadId: -1 }).lean();
  if (!last || !last.feeHeadId) return `${PREFIX}${String(1).padStart(PAD, "0")}`;

  const lastNum = parseInt(last.feeHeadId.replace(PREFIX, ""), 10) || 0;
  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// GET latest feeHeadId
exports.getLatestFeeHeadId = async (_req, res) => {
  try {
    const nextId = await generateNextFeeHeadId();
    res.json({ feeHeadId: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get next Fee Head ID" });
  }
};

// GET all fee heads
exports.getAllFeeHeads = async (_req, res) => {
  try {
    const feeHeads = await FeeHead.find().lean();
    res.json(feeHeads);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch fee heads" });
  }
};

// POST create fee head
exports.createFeeHead = async (req, res) => {
  try {
    const { feeHeadName, description } = req.body;
    if (!feeHeadName) {
      return res.status(400).json({ error: "feeHeadName is required" });
    }

    const exists = await FeeHead.findOne({ feeHeadName });
    if (exists) {
      return res.status(400).json({ error: `${exists.feeHeadName} already exists` });
    }

    const feeHeadId = await generateNextFeeHeadId();

    const doc = new FeeHead({
      feeHeadId,
      feeHeadName,
      description,
    });

    await doc.save();
    await logActivity(`Added Fee Head: ${feeHeadName}`); // Activity logged
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create fee head" });
  }
};

// PUT update fee head
exports.updateFeeHead = async (req, res) => {
  try {
    const { id } = req.params;
    const { feeHeadName, feeType, description } = req.body;

    // check duplicate (exclude current record)
    const exists = await FeeHead.findOne({ feeHeadName, _id: { $ne: id } });
    if (exists) {
      return res.status(400).json({ error: "This Fee Head already Exists" });
    }

    const payload = { feeHeadName, feeType, description };
    const updated = await FeeHead.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Fee Head not found" });

    await logActivity(`Updated Fee Head: ${updated.feeHeadName}`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update fee head" });
  }
};


// DELETE fee head
exports.deleteFeeHead = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FeeHead.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Fee Head not found" });

    await logActivity(`Deleted Fee Head: ${deleted.feeHeadName}`); // Activity logged
    res.json({ message: "Fee Head deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete fee head" });
  }
};
