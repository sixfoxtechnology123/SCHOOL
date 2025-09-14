const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const {
  getIdCardByStudentId,
  saveIdCard,
} = require("../controller/idCardController");

// Get ID Card (prefilled if not exists)
router.get("/:studentId", getIdCardByStudentId);

// Create or Update by studentId
router.post("/:studentId", upload.single("photo"), saveIdCard);
router.put("/:studentId", upload.single("photo"), saveIdCard);

module.exports = router;
