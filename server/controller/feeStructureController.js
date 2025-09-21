const FeeStructure = require("../models/FeeStructure");
const TransportRoute = require("../models/TransportRoute");
const AcademicSession = require("../models/AcademicSession");
const ClassMaster = require("../models/Class");
const FeeHead = require("../models/FeeHead");

const PREFIX = "FEES";
const PAD = 3;

// Generate next FeeStructID
async function generateNextFeeStructId() {
  const last = await FeeStructure.findOne().sort({ feeStructId: -1 }).lean();
  if (!last || !last.feeStructId) return `${PREFIX}${String(1).padStart(PAD, "0")}`;
  const lastNum = parseInt(last.feeStructId.replace(PREFIX, ""), 10) || 0;
  return `${PREFIX}${String(lastNum + 1).padStart(PAD, "0")}`;
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
    const fixedList = list.map(item => ({
      ...item,
      distance: item.distance
        ? item.distance.includes("KM") ? item.distance : `${item.distance} KM`
        : ""
    }));
    res.json(fixedList);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fee structures" });
  }
};

// Create Fee Structure
exports.createFeeStructure = async (req, res) => {
  try {
    const { classId, feeHeadId, routeId, amount, academicSession } = req.body;

    if (!classId || !feeHeadId || !amount || !academicSession)
      return res.status(400).json({ error: "All fields are required" });

    const feeStructId = await generateNextFeeStructId();

    const classObj = await ClassMaster.findOne({ classId }).lean();
    const feeHeadObj = await FeeHead.findOne({ feeHeadId }).lean();

    let distance = "";
    if (routeId && feeHeadObj?.feeHeadName.toLowerCase() === "transport") {
      const routeObj = await TransportRoute.findOne({ routeId }).lean();
      if (routeObj?.distance) {
        distance = routeObj.distance.includes("KM")
          ? routeObj.distance
          : `${routeObj.distance} KM`;
      }
    }

    // ---- VALIDATION: prevent duplicate ----
    const exists = await FeeStructure.findOne({
      academicSession,
      classId,
      feeHeadId,
      distance
    }).lean();
    if (exists) {
      return res.status(400).json({
        error: "Fee Structure already exists for same Session, Class, Fee Head and Distance"
      });
    }

    const doc = new FeeStructure({
      feeStructId,
      academicSession,
      classId,
      feeHeadId,
      className: classObj?.className || "",
      feeHeadName: feeHeadObj?.feeHeadName || "",
      distance,
      amount
    });

    await doc.save();
    res.status(201).json(doc);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving Fee Structure" });
  }
};

// Update Fee Structure
exports.updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const { classId, feeHeadId, routeId, amount, academicSession } = req.body;

    const payload = { academicSession, amount };

    if (classId) {
      const classObj = await ClassMaster.findOne({ classId }).lean();
      payload.classId = classId;
      payload.className = classObj?.className || "";
    }

    if (feeHeadId) {
      const feeHeadObj = await FeeHead.findOne({ feeHeadId }).lean();
      payload.feeHeadId = feeHeadId;
      payload.feeHeadName = feeHeadObj?.feeHeadName || "";
    }

    if (routeId && payload.feeHeadName?.toLowerCase() === "transport") {
      const routeObj = await TransportRoute.findOne({ routeId }).lean();
      if (routeObj?.distance) {
        payload.routeId = routeId;
        payload.distance = routeObj.distance.includes("KM")
          ? routeObj.distance
          : `${routeObj.distance} KM`;
      }
    } else {
      payload.routeId = "";
      payload.distance = "";
    }

    // ---- VALIDATION: prevent duplicate on update ----
    const exists = await FeeStructure.findOne({
      _id: { $ne: id },
      academicSession: payload.academicSession,
      classId: payload.classId,
      feeHeadId: payload.feeHeadId,
      distance: payload.distance
    }).lean();
    if (exists) {
      return res.status(400).json({
        error: "Fee Structure already exists for same Session, Class, Fee Head and Distance"
      });
    }

    const updated = await FeeStructure.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "Fee Structure not found" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving Fee Structure" });
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
    res.status(500).json({ error: "Failed to delete Fee Structure" });
  }
};

// Get Fee Amount
exports.getFeeAmount = async (req, res) => {
  try {
    const { className, feeHeadName, routeName } = req.query;
    if (!className || !feeHeadName)
      return res.status(400).json({ error: "className and feeHeadName are required" });

    const isTransport = feeHeadName.toLowerCase().includes("transport");
    if (isTransport && routeName) {
      const route = await TransportRoute.findOne({ routeName }).lean();
      return res.json({ amount: route?.vanCharge || 0 });
    }

    const fee = await FeeStructure.findOne({
      className,
      feeHeadName,
      ...(routeName && { routeName })
    }).lean();
    res.json({ amount: fee?.amount || 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fee amount" });
  }
};

// Get all Academic Sessions
exports.getAllAcademicSessions = async (_req, res) => {
  try {
    const sessions = await AcademicSession.find().lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch academic sessions" });
  }
};

// Get transport routes by academic session
exports.getTransportRoutesBySession = async (req, res) => {
  try {
    const { academicSession } = req.query;
    if (!academicSession) return res.status(400).json({ error: "academicSession is required" });

    const routes = await TransportRoute.find({ academicSession }).lean();
    res.json(routes.map(r => ({
      _id: r._id,
      routeId: r.routeId,
      routeName: r.routeName || r.routeId,
      distance: r.distance
        ? r.distance.includes("KM") ? r.distance : `${r.distance} KM`
        : "",
      vanCharge: r.vanCharge,
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transport routes" });
  }
};
