const Payment = require("../models/Payment");

//  Get daily collection summary
exports.getDailyCollections = async (req, res) => {
  try {
    const records = await Payment.aggregate([
      {
        $group: {
          _id: "$date", // since your schema stores date as String
          totalStudents: { $addToSet: "$student" }, // unique students
          totalAmount: { $sum: "$totalAmount" }
        }
      },
      {
        $project: {
          date: "$_id",
          totalStudents: { $size: "$totalStudents" },
          totalAmount: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching daily collection", error });
  }
};
