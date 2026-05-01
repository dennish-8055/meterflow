const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

require("dotenv").config();

// 🔧 Models
const ApiKey = require("./models/ApiKey");

// 🔧 Middleware
const rateLimiter = require("./middleware/rateLimiter");

// 🔧 Routes
const authRoutes = require("./routes/authRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const billingRoutes = require("./routes/billing");
const apiRoutes = require("./routes/apiRoutes");
const usageRoutes = require("./routes/usageRoutes");

// 🔧 API Gateway
const apiGateway = require("./middleware/apiGateway");

const app = express();

// ==================
// 🔥 GLOBAL MIDDLEWARE
// ==================
app.use(cors());
app.use(express.json());

// ==================
// 🔥 ROUTES (JWT PROTECTED)
// ==================
app.use("/api/auth", authRoutes);
app.use("/api/keys", apiKeyRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/apis", apiRoutes);
app.use("/api/usage", usageRoutes);

// 🔥 GATEWAY ROUTE
app.all("/api/gateway", apiGateway);

// ==================
// 🧪 TEST ROUTE
// ==================
app.get("/", (req, res) => {
  res.send("🚀 MeterFlow API Running");
});

// ==================
// 🗄️ DATABASE
// ==================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// ==================
// ⏱️ CRON JOB (RESET USAGE DAILY)
// ==================
cron.schedule("0 0 * * *", async () => {
  try {
    await ApiKey.updateMany({}, { usageCount: 0 });
    console.log("🔄 Usage reset at midnight");
  } catch (err) {
    console.error("Cron error:", err);
  }
});

// ==================
// 🚀 START SERVER
// ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});