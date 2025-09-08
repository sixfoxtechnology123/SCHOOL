const express = require("express");
const router = express.Router();
const {
  getAllFeeStructures,
  getLatestFeeStructId,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getFeeAmount,
  getAllTransportRoutes,
} = require("../controller/feeStructureController");

// Fee Structure endpoints
router.get("/", getAllFeeStructures);
router.get("/latest", getLatestFeeStructId);
router.post("/", createFeeStructure);
router.put("/:id", updateFeeStructure);
router.delete("/:id", deleteFeeStructure);
router.get("/get-amount", getFeeAmount);

// Transport Routes endpoint
router.get("/transport/routes", getAllTransportRoutes);

module.exports = router;
