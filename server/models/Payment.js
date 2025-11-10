const mongoose = require("mongoose");

const feeDetailSchema = new mongoose.Schema({
  feeHead: { type: String, required: true },
  originalAmount: { type: Number, default: 0 }, // original fee
  scholarshipAmount: { type: Number, default: 0 },
  amount: { type: Number, required: true },     // actual fee
  paymentStatus: { type: String, enum: ["Full Payment", "Pending"], default: "Full Payment" },
  amountPaid: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  otherName: { type: String, default: "" },      // for "Other" fee
  distance: { type: String, default: "" },
  selectedMonth: [String]
});

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    student: { type: String, required: true }, // store student ID
    studentName: { type: String, default: "" },
    academicSession: { type: String, default: "" },
    admitClass: { type: String, default: "" },
    section: { type: String, default: "" },
    rollNo: { type: String, default: "" },
    feeDetails: [feeDetailSchema],
    admissionScholarshipApplied: { type: Boolean, default: false },
    sessionScholarshipApplied: { type: Boolean, default: false },

    date: { type: String, default: new Date().toISOString().split("T")[0] },
    totalAmount: { type: Number, required: true, default: 0 },
    currentFee: { type: Number, default: 0 },
    lateFine: { type: Number, default: 0 },  
    totalFee: { type: Number, default: 0 }, 
    paymentStatus: {
      type: String,
      enum: ["Full Payment", "Pending"],
      default: "Full Payment",
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    overallPendingAmount: { type: Number, default: 0 },

    discount: { type: Number, default: 0 },
    netPayable: { type: Number, default: 0 },

    totalPaidAmount: { type: Number, default: 0 },    // total paid amount
    totalPendingAmount: { type: Number, default: 0 },

    paymentMode: {
      type: String,
      enum: ["Cash", "Card", "UPI", "NetBanking", "No Payment"],
      required: true,
    },
    transactionId: { type: String, default: "" },
    cardNumber: { type: String, default: "" },
    remarks: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // user ID
    collectedBy: String, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
