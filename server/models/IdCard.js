// models/IdCard.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  vill: String,
  po: String,
  block: String,
  pin: String,
  ps: String,
  dist: String,
});

const idCardSchema = new mongoose.Schema(
  {
    studentName: String,
    dob: String,
    className: String,
    bloodGroup: String,
    fatherName: String,
    motherName: String,
    contactNo: String,
    whatsappNo: String,
    permanentAddress: addressSchema,
    photo: String, // path or base64 URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("IdCard", idCardSchema);
