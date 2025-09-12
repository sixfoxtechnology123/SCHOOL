const mongoose = require("mongoose");
const ClassMaster = require("../models/Class");

const PREFIX = "C";
const PAD = 2; // C01, C02, etc.

// Generate next Class ID
async function generateNextClassId() {
  const last = await ClassMaster.findOne().sort({ classId: -1 }).lean();
  if (!last || !last.classId) return `${PREFIX}${String(1).padStart(PAD, "0")}`;

  const lastNum = parseInt(last.classId.replace(PREFIX, ""), 10) || 0;
  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// GET latest classId
exports.getLatestClassId = async (_req, res) => {
  try {
    const nextId = await generateNextClassId();
    res.json({ classId: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get next class ID" });
  }
};

// GET all classes
exports.getAllClasses = async (_req, res) => {
  try {
    const classes = await ClassMaster.find().lean();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch classes" });
  }
};

// GET unique class names (for dropdown)
exports.getUniqueClasses = async (_req, res) => {
  try {
    const classes = await ClassMaster.distinct("className");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch unique classes" });
  }
};
// GET sections by class
exports.getSectionsByClass = async (req, res) => {
  try {
    const { className } = req.params;
    if (!className) return res.status(400).json({ error: "className is required" });

    // fetch documents matching className
    const sections = await ClassMaster.find({ className }).select("section -_id").lean();
    
    // remove duplicates
    const uniqueSections = [...new Set(sections.map(s => s.section))];

    res.json(uniqueSections);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch sections" });
  }
};


// POST create class
exports.createClass = async (req, res) => {
  try {
    const { className, section } = req.body;
    if (!className || !section) {
      return res.status(400).json({ error: "className and section are required" });
    }

    const classId = await generateNextClassId();

    const doc = new ClassMaster({
      classId,
      className,
      section,
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create class" });
  }
};

// PUT update class
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.classId) delete payload.classId; // Don't allow changing ID

    const updated = await ClassMaster.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Class not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update class" });
  }
};

// DELETE class
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ClassMaster.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Class not found" });

    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete class" });
  }
};
