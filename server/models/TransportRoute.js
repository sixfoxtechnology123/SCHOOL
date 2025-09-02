// models/TransportRoute.js
const mongoose = require("mongoose");

const transportRouteSchema = new mongoose.Schema(
  {
    routeId: { type: String, required: true, unique: true }, // TRANSPORT001
    routeName: { type: String, required: true }, // free text
    vanCharge: { type: Number, required: true }, // numeric
  },
  {
    timestamps: false,
    collection: "transportroutes",
  }
);

module.exports = mongoose.model("TransportRoute", transportRouteSchema);
