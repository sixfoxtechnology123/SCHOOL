const express = require("express");
const router = express.Router();
const {
  getAllRoutes,
  getLatestRouteId,
  createRoute,
  updateRoute,
  deleteRoute,
} = require("../controller/transportRouteController");

router.get("/", getAllRoutes);
router.get("/latest", getLatestRouteId);
router.post("/", createRoute);
router.put("/:id", updateRoute);
router.delete("/:id", deleteRoute);

module.exports = router;
