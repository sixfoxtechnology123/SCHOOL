const express = require("express");
const router = express.Router();
const { getDailyCollections } = require("../controller/dailycollectionController");

//  GET: fetch daily collections summary
router.get("/daily-collection", getDailyCollections);

module.exports = router;
