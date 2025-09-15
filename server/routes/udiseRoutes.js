const express = require("express");
const router = express.Router();
const multer = require("multer");
const { saveUdise, getUdiseByStudentId } = require("../controller/udiseController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get UDISE by studentId
router.get("/:studentId", getUdiseByStudentId);

// Save new UDISE (with studentId param for consistency)
router.post("/:studentId", upload.single("photo"), saveUdise);

// Update existing UDISE
router.put("/:studentId", upload.single("photo"), saveUdise);

module.exports = router;
