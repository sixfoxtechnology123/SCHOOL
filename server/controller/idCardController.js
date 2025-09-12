// controllers/idCardController.js
const IdCard = require("../models/IdCard");

// GET all ID cards
exports.getAllIdCards = async (_req, res) => {
  try {
    const cards = await IdCard.find().lean();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch ID cards" });
  }
};

// POST create ID card
exports.createIdCard = async (req, res) => {
  try {
    const doc = new IdCard(req.body);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create ID card" });
  }
};

// PUT update ID card
exports.updateIdCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await IdCard.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "ID card not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update ID card" });
  }
};

// DELETE ID card
exports.deleteIdCard = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await IdCard.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "ID card not found" });
    res.json({ message: "ID card deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete ID card" });
  }
};
