const express = require("express");
const router = express.Router();
const {
  getAllReceipts,
  getLatestReceiptNo,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getAllStudents,   
} = require("../controller/receiptController");

router.get("/", getAllReceipts);
router.get("/latest", getLatestReceiptNo);
router.get("/students", getAllStudents); // ✅ add this route
router.post("/", createReceipt);
router.put("/:id", updateReceipt);
router.delete("/:id", deleteReceipt);

module.exports = router;
