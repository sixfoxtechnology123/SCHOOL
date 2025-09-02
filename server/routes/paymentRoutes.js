// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  getLatestPaymentId,
  createPayment,
  updatePayment,
  deletePayment,
} = require("../controller/paymentController");

router.get("/", getAllPayments);
router.get("/latest", getLatestPaymentId);
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

module.exports = router;
