const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    feeStructId: { type: String, required: true, unique: true },
    classId: { type: String, required: true, ref: "ClassMaster" },
    feeHeadId: { type: String, required: true, ref: "FeeHead" },
    routeId: { type: String, ref: "TransportRoute" },
    amount: { type: Number, required: true },
    academicSession: { type: String, required: true },
  },
  {
    timestamps: false,
    collection: "feestructure",
  }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
