const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const crypto = require("crypto");

const ApiKey = require("../models/ApiKey");
const UsageLog = require("../models/UsageLog");

const {
  createKey,
  getKeys,
  deleteKey,
} = require("../controllers/apiKeyController");


// 🔑 CREATE KEY
router.post("/", auth, createKey);

// 📄 GET ALL KEYS
router.get("/", auth, getKeys);

// ❌ DELETE KEY
router.delete("/:id", auth, deleteKey);


// 🚫 REVOKE KEY (NEW)
router.patch("/revoke/:id", auth, async (req, res) => {
  try {
    const key = await ApiKey.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!key) return res.status(404).json({ message: "Key not found" });

    res.json({ message: "API key revoked", key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔄 ROTATE KEY (NEW)
router.post("/rotate/:id", auth, async (req, res) => {
  try {
    const newKey = crypto.randomBytes(32).toString("hex");

    const key = await ApiKey.findByIdAndUpdate(
      req.params.id,
      { key: newKey },
      { new: true }
    );

    if (!key) return res.status(404).json({ message: "Key not found" });

    res.json({ message: "API key rotated", key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📊 USAGE LOGS (FIXED — only ONE route)
router.get("/usage", auth, async (req, res) => {
  try {
    const logs = await UsageLog.find({ apiKey: { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Error fetching usage logs" });
  }
});


module.exports = router;