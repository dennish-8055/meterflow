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
    console.error("Billing calculate error:", err);
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
    console.error("Billing history error:", err);
    res.status(500).json({ error: err.message });
  }
});


// 💳 PAYMENT (FIXED VERSION)
router.post("/pay", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ get API keys
    const keys = await ApiKey.find({ userId });

    if (!keys || keys.length === 0) {
      return res.status(400).json({ message: "No API keys found" });
    }

    // ✅ calculate total usage safely
    let totalRequests = 0;

    keys.forEach((k) => {
      totalRequests += k.usageCount || 0; // prevent undefined error
    });

    const costPerRequest = 0.01;
    const amount = totalRequests * costPerRequest;

    if (amount === 0) {
      return res.status(400).json({ message: "No usage to bill" });
    }

    // ✅ create billing record
    const bill = await Billing.create({
      userId,
      totalRequests,
      costPerRequest,
      amount,
      status: "paid",
      paymentId: "PAY_" + Date.now(),
      billingPeriodStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
      billingPeriodEnd: new Date(),
    });

    // ✅ OPTIONAL: reset usage after payment
    await ApiKey.updateMany(
      { userId },
      { $set: { usageCount: 0 } }
    );

    res.json({
      message: "Payment successful",
      bill,
    });

  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ message: "Payment failed", error: err.message });
  }
});

module.exports = router;