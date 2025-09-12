// controllers/udiseController.js
const Udise = require("../models/Udise");

// GET all UDISE records
exports.getAllUdise = async (_req, res) => {
  try {
    const records = await Udise.find().lean();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch UDISE records" });
  }
};

// POST create UDISE record
exports.createUdise = async (req, res) => {
  try {
    const doc = new Udise(req.body);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create UDISE record" });
  }
};

// PUT update UDISE record
exports.updateUdise = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Udise.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "UDISE record not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update UDISE record" });
  }
};

// DELETE UDISE record
exports.deleteUdise = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Udise.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "UDISE record not found" });
    res.json({ message: "UDISE record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete UDISE record" });
  }
};
