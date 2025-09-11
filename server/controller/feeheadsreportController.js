// controller/feeheadsreportController.js
const Payment = require("../models/Payment");

// Get Fee Head-wise Summary (returns students as objects: {name, class, section})
exports.getFeeHeadSummary = async (req, res) => {
  try {
    const records = await Payment.aggregate([
      // expand each feeDetails entry into its own doc
      { $unwind: "$feeDetails" },

      // group by feeHead and collect unique student objects
      {
        $group: {
          _id: "$feeDetails.feeHead",
          students: {
            $addToSet: {
              name: "$student",
              class: "$className",
              section: "$section",
            },
          },
          amountCollected: { $sum: "$feeDetails.amount" },
        },
      },

      // project final shape
      {
        $project: {
          feeHead: "$_id",
          studentsPaid: { $size: "$students" },
          amountCollected: 1,
          students: 1,
          _id: 0,
        },
      },

      // optional sorting by feeHead name
      { $sort: { feeHead: 1 } },
    ]);

    // debug log (check your server console)
    // console.log("Fee Head Summary result:", JSON.stringify(records, null, 2));

    res.json(records);
  } catch (error) {
    console.error("Error fetching fee head summary:", error);
    res.status(500).json({ message: "Error fetching fee head summary", error: String(error) });
  }
};
