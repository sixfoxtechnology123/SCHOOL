// routes/feeHeadRoutes.js
const express = require("express");
const router = express.Router();

const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const {
  getAllFeeHeads,
  getLatestFeeHeadId,
  createFeeHead,
  updateFeeHead,
  deleteFeeHead,
} = require("../controller/feeHeadController");

router.get("/", getAllFeeHeads);
router.get("/latest", getLatestFeeHeadId);
router.post("/", createFeeHead);
//router.put("/:id", authMiddleware, adminOnly,updateFeeHead);
router.put("/:id",updateFeeHead);
router.delete("/:id",authMiddleware, adminOnly, deleteFeeHead);

module.exports = router;
