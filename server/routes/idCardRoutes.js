const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // memory storage
const { getIdCardByStudentId, saveIdCard } = require("../controller/idCardController");

router.get("/:studentId", getIdCardByStudentId);
router.post("/", upload.single("photo"), saveIdCard);

module.exports = router;
