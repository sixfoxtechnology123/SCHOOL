// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  getLatestPaymentId,
  createPayment,
  updatePayment,
  deletePayment,
  getAllStudents,
  getFeeAmount, //  added
} = require("../controller/paymentController");

// Routes
router.get("/", getAllPayments);
router.get("/latest", getLatestPaymentId);
router.get("/students", getAllStudents);
router.get("/fee-amount", getFeeAmount); //  NEW route
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

module.exports = router;
