import express from "express";
import ActivityLog from "../models/ActivityLog.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const activities = await ActivityLog.find().sort({ timestamp: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all activities
router.delete("/", async (_req, res) => {
  try {
    await ActivityLog.deleteMany({});
    res.json({ message: "All activities cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
