// models/FeeStructure.js
const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    feeStructId: { type: String, required: true, unique: true }, // FEES001
    classId: { type: String, required: true, ref: "ClassMaster" },
    feeHeadId: { type: String, required: true, ref: "FeeHead" },
    amount: { type: Number, required: true },
  },
  {
    timestamps: false,
    collection: "feestructure",
  }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
