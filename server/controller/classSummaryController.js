// controller/classSummaryController.js
const Payment = require("../models/Payment");
// controller/sessionController.js
const AcademicSession = require("../models/AcademicSession"); // your session master model

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await AcademicSession.find({}, { sessionName: 1, _id: 0 });
    // Map to array of session strings
    const sessionList = sessions.map(s => s.sessionName);
    res.json(sessionList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sessions", error });
  }
};


exports.getClassSummary = async (req, res) => {
  try {
    // Step 1: Aggregate payments grouped by class, section, session
    const payments = await Payment.aggregate([
      { $match: { amountPaid: { $gt: 0 } } },
      {
        $group: {
          _id: {
            className: { $trim: { input: "$admitClass" } },
            section: { $toUpper: { $trim: { input: "$section" } } },
            session: "$academicSession",
          },
          students: {
            $push: {
              studentId: "$student",
              name: "$studentName",
              class: "$admitClass",
              section: "$section",
              rollNo: "$rollNo",
              amountPaid: "$amountPaid",
              session: "$academicSession",
            },
          },
          totalAmount: { $sum: "$amountPaid" },
        },
      },
    ]);

    const result = payments.map(p => ({
      className: p._id.className,
      section: p._id.section,
      session: p._id.session,
      studentsPaid: p.students.length,
      totalAmount: p.totalAmount,
      students: p.students,
    }));

    // Optional: sort by session, class, section
    result.sort((a, b) =>
      b.session.localeCompare(a.session) ||
      a.className.localeCompare(b.className) ||
      a.section.localeCompare(b.section)
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching class/section summary", error });
  }
};
