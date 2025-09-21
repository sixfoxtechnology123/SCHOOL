const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    feeStructId: { type: String, required: true, unique: true },
    classId: { type: String, required: true }, // can keep ID
    className: { type: String },              // store class name
    feeHeadId: { type: String, required: true },
    feeHeadName: { type: String },            // store fee head name
    distance: { type: String },              // store route name
    amount: { type: Number, required: true },
    academicSession: { type: String, required: true },
  },
  {
    timestamps: false,
    collection: "feestructure",
  }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
