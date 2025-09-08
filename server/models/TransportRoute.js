// models/TransportRoute.js
const mongoose = require("mongoose");

const transportRouteSchema = new mongoose.Schema(
  {
    routeId: { type: String, required: true, unique: true }, // TRANSPORT001
    distance: { type: String, required: true }, // Dropdown values like "0-5", "6-10"
    vanCharge: { type: Number, required: true }, // numeric
  },
  {
    timestamps: false,
    collection: "transportroutes",
  }
);

module.exports = mongoose.model("TransportRoute", transportRouteSchema);
