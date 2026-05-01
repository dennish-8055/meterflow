const mongoose = require("mongoose");

const usageLogSchema = new mongoose.Schema(
  {
    apiKey: String,
    endpoint: String,
    status: Number,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true } // 🔥 THIS FIXES EVERYTHING
);

module.exports = mongoose.model("UsageLog", usageLogSchema);