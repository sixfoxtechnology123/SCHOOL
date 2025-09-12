// routes/udiseRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUdise,
  createUdise,
  updateUdise,
  deleteUdise,
} = require("../controller/udiseController");

router.get("/", getAllUdise);
router.post("/", createUdise);
router.put("/:id", updateUdise);
router.delete("/:id", deleteUdise);

module.exports = router;
