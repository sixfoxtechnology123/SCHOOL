const Payment = require("../models/Payment");

// Get Outstanding Fees (latest pending receipt per student)
const getOutstandingFees = async (req, res) => {
  try {
    const outstanding = await Payment.aggregate([
      // Only consider payments that still have a pending amount
      { $match: { pendingAmount: { $gt: 0 } } },

      // Sort by student (to group) and by _id desc so the newest document for each student comes first
      { $sort: { student: 1, _id: -1 } },

      // Group by student id — take the FIRST entry (which will be the latest one because of the sort)
      {
        $group: {
          _id: "$student",                   // group by student id (unique)
          studentId: { $first: "$student" },
          studentName: { $first: "$studentName" },
          class: { $first: "$admitClass" },
          section: { $first: "$section" },
          rollNo: { $first: "$rollNo" },
          pendingAmount: { $first: "$pendingAmount" },
          latestPaymentId: { $first: "$paymentId" },
          latestDate: { $first: "$date" }
        }
      },

      // Shape the output (remove _id)
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

      // Optional: sort for display
      { $sort: { class: 1, section: 1, rollNo: 1 } }
    ]);

    // Debugging: you can uncomment the next line temporarily to inspect results in server console
    // console.log("Outstanding aggregation result:", outstanding);

    res.json(outstanding);
  } catch (err) {
    console.error("Error fetching outstanding fees:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getOutstandingFees };
