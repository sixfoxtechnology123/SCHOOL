// routes/feeHeadRoutes.js
const express = require("express");
const router = express.Router();
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
router.put("/:id", updateFeeHead);
router.delete("/:id", deleteFeeHead);

module.exports = router;
