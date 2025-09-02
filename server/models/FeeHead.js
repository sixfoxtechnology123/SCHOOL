// models/FeeHead.js
const mongoose = require("mongoose");

const feeHeadSchema = new mongoose.Schema(
  {
    feeHeadId: { type: String, required: true, unique: true }, // F01, F02
    feeHeadName: { type: String, required: true }, // Tuition, Admission, Exam...
    description: { type: String },
  },
  {
    timestamps: false,
    collection: "feeheads",
  }
);

module.exports = mongoose.model("FeeHead", feeHeadSchema);
