// models/AcademicSession.js
const mongoose = require("mongoose");

const academicSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true }, // ACDSESS001
    year: { type: String, required: true }, // e.g., 2025-26
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
  },
  {
    timestamps: false,
    collection: "academicsession",
  }
);

module.exports = mongoose.model("AcademicSession", academicSessionSchema);
