const express = require("express");
const { getOutstandingFees, getStudentFeeDetails } = require("../controller/outstandingFeesController");

const router = express.Router();

// GET Outstanding Fees Report
router.get("/outstanding-fees", getOutstandingFees);

// GET Student Fee Details by studentId
router.get("/student-fees/:studentId", getStudentFeeDetails);

module.exports = router;
