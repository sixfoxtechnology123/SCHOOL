const Payment = require("../models/Payment");

// Get Outstanding Fees (latest pending receipt per student)
const getOutstandingFees = async (req, res) => {
  try {
    const outstanding = await Payment.aggregate([
      { $sort: { student: 1, _id: -1 } },
      {
        $group: {
          _id: "$student",
          studentId: { $first: "$student" },
          studentName: { $first: "$studentName" },
          class: { $first: "$admitClass" },
          section: { $first: "$section" },
          rollNo: { $first: "$rollNo" },
          totalPendingAmount: { $first: "$totalPendingAmount" },
          overallPendingAmount: { $first: "$overallPendingAmount" },
          latestPaymentId: { $first: "$paymentId" },
          latestDate: { $first: "$date" }
        }
      },
      {
        $addFields: {
          pendingAmount: {
            $add: [
              { $ifNull: ["$totalPendingAmount", 0] },
              { $ifNull: ["$overallPendingAmount", 0] }
            ]
          }
        }
      },
      { $match: { pendingAmount: { $gt: 0 } } },
      {
        $project: {
          _id: 0,
          studentId: 1,
          studentName: 1,
          class: 1,
          section: 1,
          rollNo: 1,
          pendingAmount: 1,
          latestPaymentId: 1,
          latestDate: 1
        }
      },
      { $sort: { class: 1, section: 1, rollNo: 1 } }
    ]);

    res.json(outstanding);
  } catch (err) {
    console.error("Error fetching outstanding fees:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get fee details for a specific student
const getStudentFeeDetails = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const latestPayment = await Payment.find({ student: studentId })
      .sort({ _id: -1 })
      .limit(1);

    if (!latestPayment || latestPayment.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const payment = latestPayment[0];

    const feeDetails = payment.feeDetails.map((f) => ({
      feeHead: f.feeHead,
      originalAmount: f.originalAmount,
      scholarshipAmount: f.scholarshipAmount,
      amountPaid: f.amountPaid,
      pendingAmount: f.pendingAmount
    }));

    res.json({
      studentName: payment.studentName,
      overallPendingAmount: payment.overallPendingAmount,
      feeDetails
    });
  } catch (err) {
    console.error("Error fetching student fee details:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getOutstandingFees, getStudentFeeDetails };
