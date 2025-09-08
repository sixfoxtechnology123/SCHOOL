const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  getLatestPaymentId,
  createPayment,
  updatePayment,
  deletePayment,
  getAllStudents,
  getFeeAmount,
} = require("../controller/paymentController");

// Payment Routes
router.get("/", getAllPayments);
router.get("/latest", getLatestPaymentId);
router.get("/students", getAllStudents);
router.get("/fee-amount", getFeeAmount); // routeId optional query param
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

module.exports = router;
