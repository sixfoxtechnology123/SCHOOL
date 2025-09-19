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
router.get("/payments/check-duplicate", controller.checkDuplicatePayment);


// New routes
router.get("/sections", controller.getSectionsByClass);
router.get("/students-by-class-section", controller.getStudentsByClassAndSection);
router.get("/classes", controller.getAllClasses);
router.get("/pending/:studentId", controller.getPreviousPending);


// CRUD routes
router.post("/", controller.createPayment);
router.put("/:id", controller.updatePayment);
router.delete("/:id", controller.deletePayment);

module.exports = router;
