const Payment = require("../models/Payment");

exports.getDailyCollections = async (req, res) => {
  try {
    const records = await Payment.aggregate([
      {
        $group: {
          _id: "$date",
          students: {
            $push: {
              studentId: "$student", 
              name: "$studentName",
              class: "$admitClass",
              section: "$section",
              rollNo: "$rollNo",
              amountPaid: "$amountPaid" // <-- add this
            },
          },
          totalAmount: { $sum: "$amountPaid" },
        },
      },
      {
        $project: {
          date: "$_id",
          totalStudents: { $size: "$students" },
          totalAmount: 1,
          students: 1,
          _id: 0,
        },
      },
      { $sort: { date: -1 } }, // <-- latest date first
    ]);

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching daily collection", error });
  }
};
