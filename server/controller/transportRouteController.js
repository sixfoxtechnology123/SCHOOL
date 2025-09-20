const TransportRoute = require("../models/TransportRoute");

const PREFIX = "TRANSPORT";
const PAD = 3; // TRANSPORT001

// Generate next Route ID
async function generateNextRouteId() {
  const last = await TransportRoute.findOne().sort({ routeId: -1 }).lean();
  if (!last || !last.routeId) return `${PREFIX}${String(1).padStart(PAD, "0")}`;

  const lastNum = parseInt(last.routeId.replace(PREFIX, ""), 10) || 0;
  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// GET latest routeId
exports.getLatestRouteId = async (_req, res) => {
  try {
    const nextId = await generateNextRouteId();
    res.json({ routeId: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get next Route ID" });
  }
};

// GET all routes
exports.getAllRoutes = async (_req, res) => {
  try {
    const routes = await TransportRoute.find().lean();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch routes" });
  }
};

// in server/controllers/transportController.js (or same file you used)
exports.createRoute = async (req, res) => {
  try {
    const { distance, vanCharge, academicSession } = req.body;
    if (!distance || vanCharge === undefined || !academicSession) {
      return res.status(400).json({ error: "distance, vanCharge and academicSession are required" });
    }

    // Prevent duplicate for same distance + session
    const exists = await TransportRoute.findOne({ distance, academicSession }).lean();
    if (exists) {
      return res
        .status(400)
        .json({ error: `This distance range already exists for session ${academicSession} with amount ${exists.vanCharge}` });
    }

    const routeId = await generateNextRouteId();
    const doc = new TransportRoute({ routeId, distance, vanCharge, academicSession });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error("Failed to create route:", err);
    res.status(500).json({ error: err.message || "Failed to create route" });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.routeId) delete payload.routeId; // prevent change

    // If distance/academicSession provided, check duplicates (exclude current doc)
    if (payload.distance && payload.academicSession) {
      const dup = await TransportRoute.findOne({
        distance: payload.distance,
        academicSession: payload.academicSession,
        _id: { $ne: id },
      }).lean();
      if (dup) {
        return res
          .status(400)
          .json({ error: `This distance range already exists for session ${payload.academicSession} with amount ${dup.vanCharge}` });
      }
    }

    const updated = await TransportRoute.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Route not found" });

    res.json(updated);
  } catch (err) {
    console.error("Failed to update route:", err);
    res.status(500).json({ error: err.message || "Failed to update route" });
  }
};


// DELETE route
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TransportRoute.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Route not found" });

    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete route" });
  }
};
