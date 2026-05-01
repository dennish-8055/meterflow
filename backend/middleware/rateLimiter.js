const ApiKey = require("../models/ApiKey");

const rateLimiter = async (req, res, next) => {
  try {
    const key = req.headers["x-api-key"];

    if (!key) {
      return res.status(401).json({ message: "API key missing" });
    }

    const apiKey = await ApiKey.findOne({ key });

    if (!apiKey || !apiKey.active) {
      return res.status(403).json({ message: "Invalid API key" });
    }

    // ✅ PLAN-BASED LIMIT (per minute)
    const limit = apiKey.plan === "pro" ? 1000 : 100;

    const now = Date.now();

    // ⏱ Reset window every 60 sec
    if (!apiKey.rateLimitWindow || now > apiKey.rateLimitWindow) {
      apiKey.rateLimitWindow = now + 60 * 1000;
      apiKey.requestCount = 1;
    } else {
      apiKey.requestCount += 1;
    }

    // 🚫 BLOCK if exceeded
    if (apiKey.requestCount > limit) {
      return res.status(429).json({
        message: "Rate limit exceeded",
        limit,
      });
    }

    // ✅ SAVE only rate data (not usage)
    await apiKey.save();

    // attach info
    req.apiKey = apiKey;

    next();
  } catch (err) {
    console.error("Rate limiter error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = rateLimiter;