// routes/feeStructureRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllFeeStructures,
  getLatestFeeStructId,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getFeeAmount, 
} = require("../controller/feeStructureController");

router.get("/", getAllFeeStructures);
router.get("/latest", getLatestFeeStructId);
router.post("/", createFeeStructure);
router.put("/:id", updateFeeStructure);
router.delete("/:id", deleteFeeStructure);

//  New route for fetching fee amount
router.get("/get-amount", getFeeAmount);

module.exports = router;
