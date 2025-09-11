// controller/studentpaymenthistoryController.js
const Payment = require("../models/Payment");

// Get all student payments
exports.getStudentPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.aggregate([
      { $unwind: "$feeDetails" },
      {
        $project: {
          studentName: "$student",
          date: 1,
          feeType: "$feeDetails.feeHead",
          amountPaid: "$feeDetails.amount",
          _id: 0,
        },
      },
      { $sort: { studentName: 1, date: 1 } },
    ]);

    res.json(payments);
  } catch (error) {
    console.error("Error fetching student payment history:", error);
    res.status(500).json({ message: "Error fetching student payment history", error: String(error) });
  }
};
