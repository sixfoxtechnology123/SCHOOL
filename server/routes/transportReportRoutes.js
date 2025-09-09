// ===== server/routes/transportReportRoutes.js =====
const express = require("express");
const router = express.Router();
const { getTransportReport } = require("../controller/transportReportController");

// GET /api/transport-report
router.get("/", getTransportReport);

module.exports = router;
