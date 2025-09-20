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
  getAllAcademicSessions
} = require("../controller/feeStructureController");

// Fee Structure endpoints
router.get("/", getAllFeeStructures);
router.get("/latest", getLatestFeeStructId);
router.post("/", createFeeStructure);
router.put("/:id", updateFeeStructure);
router.delete("/:id", deleteFeeStructure);
router.get("/get-amount", getFeeAmount);
router.get("/academics", getAllAcademicSessions);
// Transport Routes endpoint
router.get("/transport/routes", getAllTransportRoutes);

module.exports = router;
