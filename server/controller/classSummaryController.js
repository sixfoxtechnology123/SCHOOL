const Payment = require("../models/Payment");
const ClassSection = require("../models/Class");

exports.getClassSummary = async (req, res) => {
  try {
    // Step 1: Get all classes and sections from ClassSection collection
    const classes = await ClassSection.find({}, { className: 1, section: 1, _id: 0 });

    // Step 2: Aggregate payments grouped by className and section
    const payments = await Payment.aggregate([
      {
        $group: {
          _id: { 
            className: { $trim: { input: "$className" } }, 
            section: { $toUpper: { $trim: { input: "$section" } } } 
          },
          students: { $addToSet: "$student" },
          totalAmount: { $sum: "$totalAmount" },
          pendingAmount: { $sum: "$pendingAmount" },
        },
      },
    ]);

    // Step 3: Create a lookup map for quick access
    const paymentMap = {};
    payments.forEach((p) => {
      const key = `${p._id.className}_${p._id.section}`;
      paymentMap[key] = {
        students: p.students.length,
        totalAmount: p.totalAmount,
        pendingAmount: p.pendingAmount,
      };
    });

    // Step 4: Build full result including class-section combinations even without payment
    const result = classes.map((cls) => {
      const className = cls.className?.trim();
      const section = cls.section?.trim().toUpperCase();
      const key = `${className}_${section}`;

      const paymentData = paymentMap[key] || { students: 0, totalAmount: 0, pendingAmount: 0 };

      return {
        className,
        section,
        students: paymentData.students,
        totalAmount: paymentData.totalAmount,
        pendingAmount: paymentData.pendingAmount,
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
