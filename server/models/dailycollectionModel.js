const mongoose = require("mongoose");

const dailyCollectionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  totalStudents: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("DailyCollection", dailyCollectionSchema);
