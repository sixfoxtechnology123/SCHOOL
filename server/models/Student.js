const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  admissionType: { 
  type: String, 
  enum: ["new admission", "re-admission"], 
  default: "new admission" 
},

  studentId: {
  type: String,
  required: true,
  index: true  // just make it searchable, not unique
},

  admissionNo: { type: String, required: true, unique: true },

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
  languages: { type: [String], default: [] }, //  Ensure always array
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
  scholarshipForAdmissionFee: String,
  scholarshipForSessionFee: String, 
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
  remarksOfOtherPhoto:String,

   // ====== New Fields from IdCard ======
  whatsappNo: String,
  idCardPhoto: {
      data: Buffer,
      contentType: String,
    },


 // ====== New Fields from UDISE ======
 motherTongue: { type: String, default: "" },
 religion: { type: String, default: "" },
 ews: { type: String, default: "" },
 contactNo: { type: String, default: "" },
 cwsn: { type: String, default: "" },
 panchayat: { type: String, default: "" },
    // Photo
 udisePhoto: {
      data: Buffer,
      contentType: String,
    },
}, { timestamps: true });



module.exports = mongoose.model("StudentMaster", studentSchema);
