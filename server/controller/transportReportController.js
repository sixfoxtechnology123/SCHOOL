const Payment = require("../models/Payment");

exports.getTransportReport = async (req, res) => {
  try {
    // Fetch all payments with feeDetails
    const payments = await Payment.find({ feeDetails: { $exists: true, $ne: [] } }).lean();

    const reportMap = {};

    payments.forEach((p) => {
      // Find Transport fee
      const transportFee = p.feeDetails.find(f => f.feeHead === "Transport");
      if (!transportFee) return;

      const distance = transportFee.distance || "Unknown";

      if (!reportMap[distance]) {
        reportMap[distance] = {
          distance,
          studentCount: 0,
          totalAmount: 0,
        };
      }

      // Increment student count
      reportMap[distance].studentCount += 1;

      // Ensure amount is numeric
      const amount = Number(transportFee.amount) || 0;
      reportMap[distance].totalAmount += amount;
    });

    const report = Object.values(reportMap);
    res.json(report);
  } catch (err) {
    console.error("Error in getTransportReport:", err);
    res.status(500).json({ error: "Failed to fetch transport report" });
  }
};
