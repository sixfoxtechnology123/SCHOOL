// ===== server/controllers/transportReportController.js =====
const Payment = require("../models/Payment");
const Student = require("../models/Student");

// Transport Fees Report
const getTransportReport = async (req, res) => {
  try {
    // Find payments that include Transport fee
    const payments = await Payment.find({
      "feeDetails.feeHead": "Transport",
    }).lean();

    const report = await Promise.all(
      payments.map(async (p) => {
        // Extract studentId if stored as "Name - ST001"
        const studentId = p.student?.split(" - ")[1];
        let studentDoc = null;

        if (studentId) {
          studentDoc = await Student.findOne({ studentId }).lean();
        }

        // Pick transport fee detail
        const transportDetail = p.feeDetails.find(
          (f) => f.feeHead === "Transport"
        );

        return {
          studentName: studentDoc?.studentName || p.student || "-",
          distance: transportDetail?.distance || "-",
          amountPaid: transportDetail?.amount || 0,
          pendingAmount: 0, // TODO: calculate if needed
        };
      })
    );

    res.json(report);
  } catch (err) {
    console.error("Error fetching transport report:", err);
    res.status(500).json({ error: "Failed to fetch transport report" });
  }
};

module.exports = {
  getTransportReport,
};
