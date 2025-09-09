const mongoose = require("mongoose");

const feeDetailSchema = new mongoose.Schema({
  feeHead: { type: String, required: true },
  amount: { type: Number, required: true },
  distance: { type: String, default: "" }, // Added field for distance (e.g., for transport)
});

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true },
    student: { type: String, required: true },
    className: String,
    section: String,
    rollNo: String,
    feeDetails: [feeDetailSchema], // array of objects with feeHead, amount, distance
    totalAmount: { type: Number, required: true },
    date: { type: String, default: Date.now },
    paymentMode: {
      type: String,
      enum: ["Cash", "Card", "UPI", "NetBanking"],
      required: true,
    },
    transactionId: String,
    cardNumber: String,
    remarks: String,
    user: { type: String, required: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Payment", paymentSchema);
