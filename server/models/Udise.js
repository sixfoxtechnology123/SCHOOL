const mongoose = require("mongoose");

// Nested address schema like ID Card
const addressSchema = new mongoose.Schema({
  vill: { type: String, default: "" },
  po: { type: String, default: "" },
  block: { type: String, default: "" },
  pin: { type: String, default: "" },
  ps: { type: String, default: "" },
  dist: { type: String, default: "" },
});

const udiseSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    studentName: { type: String, default: "" },
    gender: { type: String, default: "" },
    height: { type: String, default: "" },
    weight: { type: String, default: "" },
    dob: { type: String, default: "" },
    className: { type: String, default: "" },
    socialCategory: { type: String, default: "" },

    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    guardianName: { type: String, default: "" },
    religion: { type: String, default: "" },
    nationality: { type: String, default: "INDIAN" },
    bplBeneficiary: { type: String, default: "" },
    guardianQualification: { type: String, default: "" },
    annualIncome: { type: String, default: "" },
    contactNo: { type: String, default: "" },

    permanentAddress: { type: addressSchema, default: () => ({}) },

    photo: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Udise", udiseSchema);
