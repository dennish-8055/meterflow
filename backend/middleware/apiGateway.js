const axios = require("axios");
const ApiKey = require("../models/ApiKey");
const UsageLog = require("../models/UsageLog");

module.exports = async (req, res) => {
  try {
    const apiKeyValue = req.headers["x-api-key"];
    const path = req.query.path;

    // 🔐 Validate input
    if (!apiKeyValue) {
      return res.status(401).json({ message: "API key required" });
    }

    if (!path) {
      return res.status(400).json({ message: "Path is required" });
    }

    // 🔑 Find API key + API
    const apiKey = await ApiKey.findOne({ key: apiKeyValue }).populate("apiId");

    if (!apiKey || !apiKey.apiId) {
      return res.status(403).json({ message: "Invalid API key" });
    }

    const baseUrl = apiKey.apiId.baseUrl;

    // ✅ SAFE URL JOIN (FIXES YOUR 404 ISSUE)
    const targetUrl =
      baseUrl.replace(/\/$/, "") + "/" + path.replace(/^\//, "");

    // 🔍 Debug logs
    console.log("BASE URL:", baseUrl);
    console.log("PATH:", path);
    console.log("👉 FINAL URL:", targetUrl);

    // 🔥 Forward request (supports query params too)
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        "Content-Type": "application/json",
      },
      data: req.body,
    });

    // 📊 Log usage
    await UsageLog.create({
      userId: apiKey.userId,
      apiKey: apiKey._id,
      endpoint: path,
      status: response.status,
    });

    // 📈 Increment usage
    apiKey.usageCount = (apiKey.usageCount || 0) + 1;
    await apiKey.save();

    // ✅ Return API response
    return res.status(response.status).json(response.data);

  } catch (err) {
    console.error("❌ GATEWAY ERROR:", err.message);

    // 🔥 Better error handling
    if (err.response) {
      return res.status(err.response.status).json({
        message: "External API error",
        error: err.response.data,
      });
    }

    res.status(500).json({
      message: "API request failed",
      error: err.message,
    });
  }
};