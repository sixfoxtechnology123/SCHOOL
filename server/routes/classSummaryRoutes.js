const express = require("express");
const router = express.Router();
const { getClassSummary } = require("../controller/classSummaryController");

// GET: fetch class/section-wise summary
router.get("/class-summary", getClassSummary);

module.exports = router;