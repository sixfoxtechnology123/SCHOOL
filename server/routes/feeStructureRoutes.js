const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllFeeStructures,
  getLatestFeeStructId,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getFeeAmount,
  getAllAcademicSessions,
  getTransportRoutesBySession,
} = require("../controller/feeStructureController");

// Fee Structure endpoints
router.get("/", getAllFeeStructures);
router.get("/latest", getLatestFeeStructId);
router.post("/", createFeeStructure);
//router.put("/:id",authMiddleware, adminOnly, updateFeeStructure);
router.put("/:id",updateFeeStructure);
router.delete("/:id",authMiddleware, adminOnly, deleteFeeStructure);
router.get("/get-amount", getFeeAmount);

// Academic sessions
router.get("/academics", getAllAcademicSessions);

// Transport Routes filtered by session
router.get("/transport/by-session", getTransportRoutesBySession);

module.exports = router;
