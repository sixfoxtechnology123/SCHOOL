const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, 
    username: { type: String, required: true, unique: true }, 
    role: { 
      type: String, 
      enum: ["Admin", "Cashier", "Accountant"], 
      required: true 
    },
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: false,
    collection: "usermaster",
  }
);

module.exports = mongoose.model("UserMaster", userSchema);
