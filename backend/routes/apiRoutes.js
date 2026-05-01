const express = require("express");
const router = express.Router();
const Api = require("../models/Api");
const auth = require("../middleware/authMiddleware");

// ➕ CREATE API
router.post("/", auth, async (req, res) => {
  try {
    const { name, baseUrl } = req.body;

    if (!name || !baseUrl) {
      return res.status(400).json({ message: "Name and baseUrl required" });
    }

    const api = await Api.create({
      userId: req.user.id,
      name,
      baseUrl,
    });

    res.json(api);
  } catch (err) {
    console.error("CREATE API ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📄 GET USER APIs
router.get("/", auth, async (req, res) => {
  try {
    const apis = await Api.find({ userId: req.user.id });
    res.json(apis);
  } catch (err) {
    console.error("GET APIs ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;