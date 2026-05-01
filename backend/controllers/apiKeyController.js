const ApiKey = require("../models/ApiKey");
const Api = require("../models/Api");
const crypto = require("crypto");

// 🔑 Create new API key
exports.createKey = async (req, res) => {
  try {
    const { apiId } = req.body;

    if (!apiId) {
      return res.status(400).json({ message: "API is required" });
    }

    // 🔒 Ensure API belongs to user
    const api = await Api.findOne({
      _id: apiId,
      userId: req.user.id,
    });

    if (!api) {
      return res.status(403).json({ message: "Invalid API" });
    }

    const newKey = crypto.randomBytes(16).toString("hex");

    const apiKey = await ApiKey.create({
      userId: req.user.id,
      apiId,
      key: newKey,
    });

    res.status(201).json(apiKey);
  } catch (err) {
    console.error("CREATE KEY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 📄 Get keys (with populated API)
const UsageLog = require("../models/UsageLog");

exports.getKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find({ userId: req.user.id })
      .populate({
        path: "apiId",
        select: "name baseUrl",
      });

    // 🔥 attach real usage per key
    const keysWithUsage = await Promise.all(
      keys.map(async (key) => {
        const usage = await UsageLog.countDocuments({
          apiKey: key.key,
          userId: req.user.id,
        });

        return {
          ...key.toObject(),
          usage,
        };
      })
    );

    // 🔥 total requests (THIS FIXES 42 vs 37)
    const totalRequests = await UsageLog.countDocuments({
      userId: req.user.id,
    });

    res.json({
      keys: keysWithUsage,
      totalRequests,
    });

  } catch (err) {
    console.error("GET KEYS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// ❌ Delete key
exports.deleteKey = async (req, res) => {
  try {
    const deleted = await ApiKey.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Key not found" });
    }

    res.json({ message: "Key deleted" });
  } catch (err) {
    console.error("DELETE KEY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};