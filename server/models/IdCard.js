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
    studentId: { type: String, required: true, unique: true },
    studentName: String,
    dob: String,
    className: String,
    bloodGroup: String,
    fatherName: String,
    motherName: String,
    contactNo: String,
    whatsappNo: String,
    permanentAddress: addressSchema,
    photo: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("IdCard", idCardSchema);
