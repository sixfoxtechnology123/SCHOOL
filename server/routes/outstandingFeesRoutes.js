const express = require("express");
const { getOutstandingFees } = require("../controller/outstandingFeesController");

const router = express.Router();

// GET Outstanding Fees Report
router.get("/outstanding-fees", getOutstandingFees);

module.exports = router;
