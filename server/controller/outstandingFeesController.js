const Payment = require("../models/Payment");

// Get Outstanding Fees
const getOutstandingFees = async (req, res) => {
  try {
    const payments = await Payment.find({
      paymentStatus: "Pending",
      pendingAmount: { $gt: 0 }
    });

    const outstandingData = payments.map((p) => ({
      studentName: p.studentName,
      class: p.admitClass,
      section: p.section,
      pendingAmount: p.pendingAmount
    }));

    res.json(outstandingData);
  } catch (err) {
    console.error("Error fetching outstanding fees:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getOutstandingFees };
