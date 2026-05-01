const express = require("express");
const router = express.Router();
const UsageLog = require("../models/UsageLog");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    // ✅ TOTAL REQUESTS (correct fix)
    const totalRequests = await UsageLog.countDocuments({
      userId: req.user.id,
    });

    // ✅ ALL LOGS
    const logs = await UsageLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    // ✅ SUCCESS / ERROR COUNT
    const success = logs.filter(l => l.status < 400).length;
    const errors = logs.filter(l => l.status >= 400).length;

    res.json({
      totalRequests,
      success,
      errors,
      logs,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching usage" });
  }
});

module.exports = router;