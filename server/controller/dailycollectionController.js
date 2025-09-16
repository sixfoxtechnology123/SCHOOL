const Payment = require("../models/Payment");

exports.getDailyCollections = async (req, res) => {
  try {
    const records = await Payment.aggregate([
      {
        $group: {
          _id: "$date",
          students: {
            $push: {
              name: "$studentName",       // use stored studentName
              class: "$admitClass",       // use stored class
              section: "$section",
            },
          },
          totalAmount: { $sum: "$totalAmount" },
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
      { $sort: { date: 1 } },
    ]);

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching daily collection", error });
  }
};
