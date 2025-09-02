// controllers/userController.js
const bcrypt = require("bcryptjs");
const UserMaster = require("../models/User");

const PREFIX = "USER";
const PAD = 2; // USER01, USER02...

// Generate next User ID
async function generateNextUserId() {
  const last = await UserMaster.findOne().sort({ userId: -1 }).lean();
  if (!last || !last.userId) return `${PREFIX}${String(1).padStart(PAD, "0")}`;

  const lastNum = parseInt(last.userId.replace(PREFIX, ""), 10) || 0;
  const nextNum = lastNum + 1;
  return `${PREFIX}${String(nextNum).padStart(PAD, "0")}`;
}

// GET next UserID
exports.getLatestUserId = async (_req, res) => {
  try {
    const nextId = await generateNextUserId();
    res.json({ userId: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get next user ID" });
  }
};

// GET all users
exports.getAllUsers = async (_req, res) => {
  try {
    const users = await UserMaster.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch users" });
  }
};

// POST create user
exports.createUser = async (req, res) => {
  try {
    const { username, role, password } = req.body;
    if (!username || !role || !password) {
      return res.status(400).json({ error: "username, role, and password are required" });
    }

    const userId = await generateNextUserId();
    const passwordHash = await bcrypt.hash(password, 10);

    const doc = new UserMaster({
      userId,
      username,
      role,
      passwordHash,
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create user" });
  }
};

// PUT update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.userId) delete payload.userId; // don’t allow change of ID
    if (payload.password) {
      payload.passwordHash = await bcrypt.hash(payload.password, 10);
      delete payload.password;
    }

    const updated = await UserMaster.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update user" });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserMaster.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete user" });
  }
};
