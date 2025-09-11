// routes/studentpaymenthistoryRoutes.js
const express = require("express");
const router = express.Router();
const { getStudentPaymentHistory } = require("../controller/studentpaymenthistoryController");

// GET: Student Payment History
router.get("/student-history", getStudentPaymentHistory);

module.exports = router;
