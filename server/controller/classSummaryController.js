// controller/classSummaryController.js
const Payment = require("../models/Payment");
const ClassSection = require("../models/Class");

exports.getClassSummary = async (req, res) => {
  try {
    // Step 1: Get all classes and sections
    const classes = await ClassSection.find({}, { className: 1, section: 1, _id: 0 });

    // Step 2: Aggregate payments grouped by className and section
    const payments = await Payment.aggregate([
      // Only include payments with some amount paid
      { $match: { amountPaid: { $gt: 0 } } },
      {
        $group: {
          _id: {
            className: { $trim: { input: "$admitClass" } },
            section: { $toUpper: { $trim: { input: "$section" } } },
          },
          studentsSet: { $addToSet: "$student" }, // unique students
          totalAmountCollected: { $sum: "$amountPaid" },
        },
      },
    ]);

    // Step 3: Create a map for quick lookup
    const paymentMap = {};
    payments.forEach((p) => {
      const key = `${p._id.className}_${p._id.section}`;
      paymentMap[key] = {
        studentsPaid: p.studentsSet.length,
        totalAmountCollected: p.totalAmountCollected,
      };
    });

    // Step 4: Build full result including class-section combinations even without payment
    const result = classes.map((cls) => {
      const className = cls.className?.trim();
      const section = cls.section?.trim().toUpperCase();
      const key = `${className}_${section}`;
      const paymentData = paymentMap[key] || { studentsPaid: 0, totalAmountCollected: 0 };

      return {
        className,
        section,
        studentsPaid: paymentData.studentsPaid,
        totalAmount: paymentData.totalAmountCollected,
      };
    });

    // Step 5: Sort by class and section
    const romanToNumber = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10, XI:11, XII:12 };
    result.sort((a, b) => {
      const romanA = a.className.split("-")[1]?.trim();
      const romanB = b.className.split("-")[1]?.trim();
      if (romanToNumber[romanA] === romanToNumber[romanB]) {
        return a.section.localeCompare(b.section);
      }
      return romanToNumber[romanA] - romanToNumber[romanB];
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching class/section summary", error });
  }
};
