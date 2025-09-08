const FeeStructure = require("../models/FeeStructure");
const TransportRoute = require("../models/TransportRoute");

const PREFIX = "FEES";
const PAD = 3;

// Generate next FeeStructID
async function generateNextFeeStructId() {
  const last = await FeeStructure.findOne().sort({ feeStructId: -1 }).lean();
  if (!last || !last.feeStructId) return `${PREFIX}${String(1).padStart(PAD, "0")}`;
  const lastNum = parseInt(last.feeStructId.replace(PREFIX, ""), 10) || 0;
  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// Get latest FeeStructID
exports.getLatestFeeStructId = async (_req, res) => {
  try {
    const nextId = await generateNextFeeStructId();
    res.json({ feeStructId: nextId });
  } catch (err) {
    res.status(500).json({ error: "Failed to get next FeeStructID" });
  }
};

// Get all Fee Structures
exports.getAllFeeStructures = async (_req, res) => {
  try {
    const list = await FeeStructure.find().lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fee structures" });
  }
};

// Get Fee Amount
exports.getFeeAmount = async (req, res) => {
  try {
    const { classId, feeHeadId, routeId } = req.query;
    if (!classId || !feeHeadId)
      return res.status(400).json({ error: "classId and feeHeadId are required" });

    const isTransport = feeHeadId.toLowerCase().includes("transport");
    if (isTransport && routeId) {
      const route = await TransportRoute.findOne({ routeId }).lean();
      return res.json({ amount: route?.vanCharge || 0 });
    }

    const fee = await FeeStructure.findOne({ classId, feeHeadId, ...(routeId && { routeId }) }).lean();
    res.json({ amount: fee?.amount || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch fee amount" });
  }
};

// Create Fee Structure
exports.createFeeStructure = async (req, res) => {
  try {
    const { classId, feeHeadId, routeId, amount } = req.body;
    if (!classId || !feeHeadId || !amount)
      return res.status(400).json({ error: "All fields are required" });

    const feeStructId = await generateNextFeeStructId();
    const doc = new FeeStructure({ feeStructId, classId, feeHeadId, routeId, amount });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create Fee Structure" });
  }
};

// Update Fee Structure
exports.updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.feeStructId) delete payload.feeStructId;

    const updated = await FeeStructure.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Fee Structure not found" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update Fee Structure" });
  }
};

// Delete Fee Structure
exports.deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FeeStructure.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Fee Structure not found" });

    res.json({ message: "Fee Structure deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete Fee Structure" });
  }
};

// Get all Transport Routes (with distance)
exports.getAllTransportRoutes = async (_req, res) => {
  try {
    const routes = await TransportRoute.find().lean();
    // Map to include KM in distance
    const formattedRoutes = routes.map(r => ({
      routeId: r.routeId,
      distance: r.distance + " KM", // append KM
      vanCharge: r.vanCharge,
    }));
    // console.log("Transport Routes:", formattedRoutes); // debug
    res.json(formattedRoutes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transport routes" });
  }
};

