// ======= server/routes/payments.js =======
const express = require("express");
const router = express.Router();

const controller = require("../controller/paymentController");
const Payment = require("../models/Payment");

// Payment Routes
router.get("/", controller.getAllPayments);
router.get("/latest", controller.getLatestPaymentId);
router.get("/students", controller.getAllStudents);
router.get("/fee-amount", controller.getFeeAmount);

// New routes
router.get("/sections", controller.getSectionsByClass);
router.get("/students-by-class-section", controller.getStudentsByClassAndSection);
router.get("/classes", controller.getAllClasses);

// Duplicate check route
router.get("/check-duplicate", async (req, res) => {
  try {
    const { className, section, rollNo, excludeId } = req.query;
    if (!className || !section || !rollNo) {
      return res.status(400).json({ error: "className, section, and rollNo required" });
    }

    const query = { className, section, rollNo };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Payment.findOne(query);
    res.json({ exists: !!existing });
  } catch (err) {
    console.error("Error checking duplicate:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// CRUD routes
router.post("/", controller.createPayment);
router.put("/:id", controller.updatePayment);
router.delete("/:id", controller.deletePayment);

module.exports = router;
