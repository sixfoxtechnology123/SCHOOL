// models/ClassMaster.js
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    classId: { type: String, required: true, unique: true }, // C01, C02
    className: { type: String, required: true }, // Class I – XII
    section: { type: String, enum: ["A", "B", "C"], required: true },
  },
  {
    timestamps: false,
    collection: "classmaster",
  }
);

module.exports = mongoose.model("ClassMaster", classSchema);
