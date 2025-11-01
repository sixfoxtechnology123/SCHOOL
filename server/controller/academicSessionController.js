// controllers/academicSessionController.js
const AcademicSession = require("../models/AcademicSession");
const logActivity = require("../utils/logActivity");

const PREFIX = "ACDSESS";
const PAD = 3; // ACDSESS001, ACDSESS002...

// Generate next Session ID
async function generateNextSessionId() {
  const last = await AcademicSession.findOne().sort({ sessionId: -1 }).lean();
  if (!last || !last.sessionId) return `${PREFIX}${String(1).padStart(PAD, "0")}`;

  const lastNum = parseInt(last.sessionId.replace(PREFIX, ""), 10) || 0;
  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// GET latest ID
exports.getLatestSessionId = async (_req, res) => {
  try {
    const nextId = await generateNextSessionId();
    res.json({ sessionId: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get next session ID" });
  }
};

// GET all sessions
exports.getAllSessions = async (_req, res) => {
  try {
    const sessions = await AcademicSession.find().lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch sessions" });
  }
};

// POST create session
exports.createSession = async (req, res) => {
  try {
    const { year, startDate, endDate } = req.body;
    if (!year || !startDate || !endDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const exists=await AcademicSession.findOne({year});
    if(exists){
      return res.status(400).json({error:"This session already Exists"});
    }


    const sessionId = await generateNextSessionId();

    const doc = new AcademicSession({
      sessionId,
      year,
      startDate,
      endDate,
    });

    await doc.save();
    await logActivity(`Added New Academic Session: ${year}`);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create session" });
  }
};

// PUT update session
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, startDate, endDate } = req.body;

    // check if same year already exists (exclude current record)
    const exists = await AcademicSession.findOne({ year, _id: { $ne: id } });
    if (exists) {
      return res.status(400).json({ error: "This session already Exists" });
    }

    const payload = { year, startDate, endDate };
    const updated = await AcademicSession.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Session not found" });

    await logActivity(`Updated Academic Session: ${updated.year}`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update session" });
  }
};


// DELETE session
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AcademicSession.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Session not found" });
    await logActivity(`Deleted Academic Session: ${deleted.year}`);
    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete session" });
  }
};
