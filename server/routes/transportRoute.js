const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

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
//router.put("/:id", authMiddleware, adminOnly,updateRoute);
router.put("/:id", updateRoute);
router.delete("/:id",authMiddleware, adminOnly, deleteRoute);

module.exports = router;
