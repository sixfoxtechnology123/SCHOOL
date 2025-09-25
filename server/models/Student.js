const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  admissionType: { 
  type: String, 
  enum: ["new admission", "re-admission"], 
  default: "new admission" 
},

  studentId: { type: String, required: true, unique: true }, // IMPORTANT
  academicSession: { type: String, required: true },
  admissionDate: {
    type: String,
    default: Date.now, // saves current date automatically
  },
  admitClass: String,
  transferFrom: { type: String, default: "" }, 
  section: String,
  rollNo: { type: Number }, // Optional: Number is cleaner
  firstName: String,
  lastName: String,
  gender: String,
  socialCaste: String,
  dob: String,
  height: String,
  weight: String,
  bloodGroup: String,
  brothers: String,
  sisters: String,
  nationality: String,
  languages: { type: [String], default: [] }, // ✅ Ensure always array
  permanentAddress: {
    vill: String,
    po: String,
    block: String,
    pin: String,
    ps: String,
    dist: String,
  },
  currentAddress: {
    vill: String,
    po: String,
    block: String,
    pin: String,
    ps: String,
    dist: String,
  },
  transportRequired: String,
  distanceFromSchool: String,
  emergencyContact: String,
  emergencyPerson: String,
  fatherName: String,
  fatherOccupation: String,
  fatherPhone: String,
  fatherEmail: String,
  fatherNationality: String,
  fatherQualification: String,
  motherName: String,
  motherOccupation: String,
  motherPhone: String,
  motherEmail: String,
  motherNationality: String,
  motherQualification: String,
  bpl: String,
  bplNo: String,
  familyIncome: String,
  fatherPhoto: { data: Buffer, contentType: String },
  motherPhoto: { data: Buffer, contentType: String },
  childPhoto: { data: Buffer, contentType: String },
  otherDocument: { data: Buffer, contentType: String },
});

module.exports = mongoose.model("StudentMaster", studentSchema);
