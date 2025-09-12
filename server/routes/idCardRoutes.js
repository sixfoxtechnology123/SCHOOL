// routes/idCardRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllIdCards,
  createIdCard,
  updateIdCard,
  deleteIdCard,
} = require("../controller/idCardController");

router.get("/", getAllIdCards);
router.post("/", createIdCard);
router.put("/:id", updateIdCard);
router.delete("/:id", deleteIdCard);

module.exports = router;
