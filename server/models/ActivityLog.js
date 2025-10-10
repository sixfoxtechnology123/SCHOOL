const mongoose = require("mongoose");

function formatDateTime(date) {
  const d = date || new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0"); // Add seconds
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // convert 0-23 to 1-12
  const hh = String(hours).padStart(2, "0");

  return `${day}/${month}/${year} ${hh}.${minutes}.${seconds} ${ampm}`;
}

const activitySchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: String, default: () => formatDateTime(new Date()) },
});

module.exports = mongoose.model("Activity", activitySchema);
