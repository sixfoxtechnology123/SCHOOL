const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const {
  getUdiseByStudentId,
  saveUdise,
} = require("../controller/udiseController");

// GET UDISE (prefilled if not exists)
router.get("/:studentId", getUdiseByStudentId);

// Create or Update
router.post("/:studentId", upload.single("photo"), saveUdise);
router.put("/:studentId", upload.single("photo"), saveUdise);

module.exports = router;
