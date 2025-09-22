const Payment = require("../models/Payment");

exports.getTransportReport = async (req, res) => {
  try {
    const payments = await Payment.find({ feeDetails: { $exists: true, $ne: [] } }).lean();

    const reportMap = {}; // key: session + distance

    payments.forEach((p) => {
      const session = p.academicSession || "Unknown";

      // Find Transport fee
      const transportFee = p.feeDetails.find((f) => f.feeHead === "Transport");
      if (!transportFee) return;

      const distance = transportFee.distance || "Unknown";
      const amount = Number(transportFee.amount || 0); // ✅ use amount

      const key = `${session}_${distance}`;

      if (!reportMap[key]) {
        reportMap[key] = {
          academicSession: session,
          distance: distance,
          studentCount: 0,
          totalAmount: 0,
        };
      }

      reportMap[key].studentCount += 1;
      reportMap[key].totalAmount += amount; // sum Transport amount
    });

    const report = Object.values(reportMap).sort((a, b) => {
      if (a.academicSession !== b.academicSession)
        return a.academicSession.localeCompare(b.academicSession);

      const aDist = Number(a.distance.split("-")[0]) || 0;
      const bDist = Number(b.distance.split("-")[0]) || 0;
      return aDist - bDist;
    });

    res.json(report);
  } catch (err) {
    console.error("Error in getTransportReport:", err);
    res.status(500).json({ error: "Failed to fetch transport report" });
  }
};
