// controller/studentpaymenthistoryController.js

const Payment = require("../models/Payment");
// controller/academicSessionController.js
const AcademicSession = require("../models/AcademicSession");

exports.getAcademicSessions = async (req, res) => {
  try {
    const sessions = await AcademicSession.find({}, { _id: 0, year: 1 }).sort({ year: 1 });
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching academic sessions:", error);
    res.status(500).json({ message: "Error fetching academic sessions", error: String(error) });
  }
};


// ================= Get Student Payment History =================
exports.getStudentPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.aggregate([
      { $unwind: "$feeDetails" },
      {
        $project: {
          studentName: "$studentName",
          academicSession: "$academicSession",
          date: 1,
          feeType: "$feeDetails.feeHead",
          amountPaid: "$feeDetails.amount",
          _id: 0,
        },
      },
      { $sort: { studentName: 1, date: 1 } },
    ]);

    res.json(payments); // returns all payment records with academicSession included
  } catch (error) {
    console.error("Error fetching student payment history:", error);
    res.status(500).json({
      message: "Error fetching student payment history",
      error: String(error),
    });
  }
};
