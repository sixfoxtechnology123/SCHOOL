const Payment = require("../models/Payment");

// Get Outstanding Fees (latest pending receipt per student)
const getOutstandingFees = async (req, res) => {
  try {
    const outstanding = await Payment.aggregate([
      // Step 1: Sort by student and _id descending (latest first)
      { $sort: { student: 1, _id: -1 } },

      // Step 2: Group by student — take the first (latest) receipt
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


      // Step 3: Only keep students whose latest receipt has pending > 0
      { $match: { pendingAmount: { $gt: 0 } } },

      // Step 4: Shape output
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

      // Step 5: Optional: sort for display
      { $sort: { class: 1, section: 1, rollNo: 1 } }
    ]);

    res.json(outstanding);
  } catch (err) {
    console.error("Error fetching outstanding fees:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getOutstandingFees };
