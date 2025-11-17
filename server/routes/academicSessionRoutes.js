// routes/academicSessionRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware")
const {
  getAllSessions,
  getLatestSessionId,
  createSession,
  updateSession,
  deleteSession,
} = require("../controller/academicSessionController");

router.get("/", getAllSessions);
router.get("/latest", getLatestSessionId);
router.post("/", createSession);
//router.put("/:id",authMiddleware, adminOnly, updateSession);
router.put("/:id",updateSession);
router.delete("/:id",authMiddleware, adminOnly, deleteSession);

module.exports = router;
