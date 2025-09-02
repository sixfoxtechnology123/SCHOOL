// models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true }, // Payment001
    receiptNo: { type: String, required: true }, // from Receipts table
    feeHeadId: { type: String, required: true }, // from FeeHeads table
    amount: { type: Number, required: true },
  },
  {
    timestamps: false,
    collection: "payments",
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
