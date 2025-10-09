// utils/logActivity.js
const Activity = require("../models/ActivityLog");

const logActivity = async (text) => {
  if (!text) return;
  try {
    const activity = new Activity({ text });
    await activity.save();
    // console.log("Activity saved to DB:", text);
  } catch (err) {
    console.error("Failed to save activity to DB:", err);
  }
};

module.exports = logActivity;
