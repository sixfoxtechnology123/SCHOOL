// models/StudentMaster.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true }, // ST0001
    name: { type: String, required: true },
    className: { type: String, required: true }, // Link to Classes
    section: { type: String, enum: ["A", "B", "C"], required: true },
    rollNo: { type: Number, required: true },
    dob: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    address: { type: String, required: true },
    phoneNo: { type: String, required: true, match: /^[0-9]{10}$/ },
  },
  {
    timestamps: false,
    collection: "studentmaster",
  }
);

module.exports = mongoose.model("StudentMaster", studentSchema);
