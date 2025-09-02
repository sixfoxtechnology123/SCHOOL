// models/Receipt.js
const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },  // ST001, ST002
    studentName: { type: String, required: true },
    date: { type: String, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMode: { type: String, enum: ["Cash", "Card", "UPI"], required: true },
    userId: { type: String, required: true },     // USER001, USER002
    username: { type: String, required: true },
  },
  { timestamps: false, collection: "receipts" }
);

module.exports = mongoose.model("Receipt", receiptSchema);
