// routes/feeheadsreportRoutes.js
const express = require("express");
const router = express.Router();
const { getFeeHeadSummary } = require("../controller/feeheadsreportController");

// GET: Fee Head Summary
router.get("/fee-head-summary", getFeeHeadSummary);

module.exports = router;
