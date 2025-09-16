const mongoose = require("mongoose");

const feeDetailSchema = new mongoose.Schema({
  feeHead: { type: String, required: true },
  amount: { type: Number, required: true },
  distance: { type: String, default: "" },
  routeId: { type: String, default: "" },
});

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    student: { type: String, required: true }, // store student ID as string
    admitClass: String,
    section: String,
    rollNo: String,
    feeDetails: [feeDetailSchema],
    totalAmount: { type: Number, required: true },
    date: { type: String, default: new Date().toISOString().split("T")[0] },
    paymentMode: {
      type: String,
      enum: ["Cash", "Card", "UPI", "NetBanking"],
      required: true,
    },
    paymentStatus: { type: String, enum: ["Full Payment", "Pending"], default: "Full Payment" },
    amountPaid: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    transactionId: String,
    cardNumber: String,
    remarks: String,
    user: { type: String, required: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Payment", paymentSchema);
