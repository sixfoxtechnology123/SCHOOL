const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  getLatestPaymentId,
  createPayment,
  updatePayment,
  deletePayment,
  getAllStudents,
} = require("../controller/paymentController");

router.get("/", getAllPayments);
router.get("/latest", getLatestPaymentId); // auto-paymentId
router.get("/students", getAllStudents);
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

module.exports = router;
