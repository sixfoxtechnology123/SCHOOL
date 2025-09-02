// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getLatestUserId,
  createUser,
  updateUser,
  deleteUser,
} = require("../controller/userController");

router.get("/", getAllUsers);
router.get("/latest", getLatestUserId);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
