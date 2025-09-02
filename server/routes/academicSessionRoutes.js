// routes/academicSessionRoutes.js
const express = require("express");
const router = express.Router();
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
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);

module.exports = router;
