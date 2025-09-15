const mongoose = require("mongoose");

// Address Schema
const addressSchema = new mongoose.Schema({
  vill: { type: String, default: "" },
  po: { type: String, default: "" },
  block: { type: String, default: "" },
  pin: { type: String, default: "" },
  ps: { type: String, default: "" },
  dist: { type: String, default: "" },
});

// Main UDISE Schema
const udiseSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },

    // Personal Details
    studentName: { type: String, default: "" },
    gender: { type: String, default: "" },
    height: { type: String, default: "" },
    weight: { type: String, default: "" },
    dob: { type: String, default: "" },
    admitClass: { type: String, default: "" },
    motherTongue: { type: String, default: "" },
    socialCategory: { type: String, default: "" },

    // Family Details
    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    guardianName: { type: String, default: "" },
    guardianQualification: { type: String, default: "" },
    fatherQualification: { type: String, default: "" },

    // Other Details
    religion: { type: String, default: "" },
    nationality: { type: String, default: "INDIAN" },
    bpl: { type: String, default: "No" },
    bplNo: { type: String, default: "" },
    ews: { type: String, default: "" },
    familyIncome: { type: String, default: "" },
    contactNo: { type: String, default: "" },
    cwsn: { type: String, default: "" },

    // Address
    currentAddress: { type: addressSchema, default: () => ({}) },
    panchayat: { type: String, default: "" },
    // Photo
    photo: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Udise", udiseSchema);
