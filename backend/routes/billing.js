const express = require("express");
const router = express.Router();

const ApiKey = require("../models/ApiKey");
const Billing = require("../models/Billing");
const UsageLog = require("../models/UsageLog");
const auth = require("../middleware/authMiddleware");


// 💰 CALCULATE BILL (preview)
router.get("/calculate", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await UsageLog.countDocuments({ userId });

    const costPerRequest = 0.01;
    const amount = total * costPerRequest;

    res.json({
      totalRequests: total,
      costPerRequest,
      amount,
    });
  } catch (err) {
    console.error("Billing error:", err);
    res.status(500).json({ message: "Billing error" });
  }
});


// 📄 BILLING HISTORY
router.get("/history", auth, async (req, res) => {
  try {
    const bills = await Billing.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 💳 PAYMENT
router.post("/pay", auth, async (req, res) => {
  try {
    const keys = await ApiKey.find({ userId: req.user.id });

    let totalRequests = 0;

    keys.forEach((k) => {
      totalRequests += k.usageCount;
    });

    const costPerRequest = 0.01;
    const amount = totalRequests * costPerRequest;

    const bill = await Billing.create({
      userId: req.user.id,
      totalRequests,
      costPerRequest,
      amount,
      status: "paid",
      paymentId: "PAY_" + Date.now(),
      billingPeriodStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
      billingPeriodEnd: new Date(),
    });

    res.json({
      message: "Payment successful",
      bill,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;