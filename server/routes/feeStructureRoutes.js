const express = require("express");
const router = express.Router();
const {
  getAllFeeStructures,
  getLatestFeeStructId,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getFeeAmount,
  getAllTransportRoutes, // <-- added
} = require("../controller/feeStructureController");

router.get("/", getAllFeeStructures);
router.get("/latest", getLatestFeeStructId);
router.post("/", createFeeStructure);
router.put("/:id", updateFeeStructure);
router.delete("/:id", deleteFeeStructure);
router.get("/get-amount", getFeeAmount);

// NEW endpoint for transport routes
router.get("/transport/routes", getAllTransportRoutes);

module.exports = router;
