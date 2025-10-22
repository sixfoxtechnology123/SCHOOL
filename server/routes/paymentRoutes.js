// ======= server/routes/payments.js =======
const express = require("express");
const router = express.Router();
const Student = require("../models/Student"); // your Student model
const FeeMonth = require("../models/FeeStructure"); // your Student model

const controller = require("../controller/paymentController");
const { generateNextPaymentId } = require("../controller/paymentController");

const Payment = require("../models/Payment");

// Payment Routes
router.get("/", controller.getAllPayments);
router.get("/latest", controller.getLatestPaymentId);
router.get("/students", controller.getAllStudents);
router.get("/fee-amount", controller.getFeeAmount);
router.get("/payments/check-duplicate", controller.checkDuplicatePayment);
router.get("/class-fees", controller.getClassFeeStructure);
router.get("/feestructure", controller.getFeeStructureByClassAndSession);

// New routes
router.get("/sections", controller.getSectionsByClass);
router.get("/students-by-class-section", controller.getStudentsByClassAndSection);
router.get("/classes", controller.getAllClasses);
router.get("/previous-pending/:student", controller.getPreviousPending);
// New route to get pending fee heads
router.get("/pending-fee-heads/:studentId", controller.getPendingFeeHeads);

// GET scholarship by admission number
router.get("/scholarships/:admissionNo", async (req, res) => {
  try {
    const admissionNo = req.params.admissionNo;
    const student = await Student.findOne({ admissionNo });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      scholarshipForAdmissionFee: student.scholarshipForAdmissionFee || "0",
      scholarshipForSessionFee: student.scholarshipForSessionFee || "0"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// CRUD
router.post("/", (req, res, next) => {
//   console.log(" POST /api/payments HIT");
//   console.log("Body:", req.body);
  next();
}, controller.createPayment);

router.put("/:id", controller.updatePayment);
router.delete("/:id", controller.deletePayment);
// ===== New route for real-time fee calculation =====
router.post("/calc-fee", async (req, res) => {
  try {
    const paymentBody = req.body; // send studentId, feeDetails, etc.
    const calculated = await controller.populateFeeAmounts(paymentBody);
    res.json(calculated); // frontend gets feeDetails with applied scholarship
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/months', async (req, res) => {
  try {
    const { className, academicSession } = req.query;
    if (!className || !academicSession) 
      return res.status(400).json({ message: "Missing params" });

    const months = await FeeMonth.find({ 
      className, 
      academicSession, 
      feeHeadName: /Tuition/i 
    }).sort({ order: 1 }); // optional order if you have it

    // return array of objects with month and amount
    res.json(months.map(m => ({
      month: m.month,
      amount: m.amount
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/new-receipt-id", async (req, res) => {
  try {
    const newId = await generateNextPaymentId();
    res.json({ paymentId: newId });
  } catch (err) {
    console.error("Error generating new receipt ID:", err);
    res.status(500).json({ error: "Failed to generate receipt ID" });
  }
});


module.exports = router;
