// models/Udise.js
const mongoose = require("mongoose");

const udiseSchema = new mongoose.Schema(
  {
    studentName: String,
    gender: String,
    height: String,
    weight: String,
    dob: String,
    className: String,
    motherTongue: String,
    socialCategory: String,

    fatherName: String,
    motherName: String,
    guardianName: String,

    religion: String,
    nationality: { type: String, default: "INDIAN" },
    bpl: String,
    bplNo: String,
    ews: String,
    annualIncome: String,
    guardianQualification: String,

    contactNo: String,
    cwsn: String, // child with special needs
    locality: String,

    // Address details
    dist: String,
    block: String,
    panchayat: String,
    po: String,
    ps: String,
    pin: String,

    photo: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Udise", udiseSchema);
