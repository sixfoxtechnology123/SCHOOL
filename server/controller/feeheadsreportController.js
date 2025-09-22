// controller/feeheadsreportController.js
const Payment = require("../models/Payment");

// Get Fee Head-wise Summary (grouped by academicSession + feeHead)
exports.getFeeHeadSummary = async (req, res) => {
  try {
    const records = await Payment.aggregate([
      // expand each feeDetails entry
      { $unwind: "$feeDetails" },

      // group by BOTH academicSession and feeHead
      {
        $group: {
          _id: {
            feeHead: "$feeDetails.feeHead",
            academicSession: "$academicSession",
          },
          students: {
            $addToSet: {
              name: "$studentName",
              class: "$admitClass",
              section: "$section",
              academicSession: "$academicSession",
            },
          },
          amountCollected: { $sum: "$feeDetails.amount" },
        },
      },

      // reshape result
      {
        $project: {
          feeHead: "$_id.feeHead",
          academicSession: "$_id.academicSession",
          studentsPaid: { $size: "$students" },
          amountCollected: 1,
          students: 1,
          _id: 0,
        },
      },

      // sort by academicSession then feeHead
      { $sort: { academicSession: 1, feeHead: 1 } },
    ]);

    res.json(records);
  } catch (error) {
    console.error("Error fetching fee head summary:", error);
    res.status(500).json({
      message: "Error fetching fee head summary",
      error: String(error),
    });
  }
};
