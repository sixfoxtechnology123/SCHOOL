// routes/studentpaymenthistoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  getStudentPaymentHistory,
  getAcademicSessions, // import the new controller
} = require("../controller/studentpaymenthistoryController");

// GET: Student Payment History
router.get("/student-history", getStudentPaymentHistory);

// GET: Academic Sessions (for dropdown filter)
router.get("/sessions", getAcademicSessions);

module.exports = router;
