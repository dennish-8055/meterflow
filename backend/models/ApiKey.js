const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // 🔥 LINK KEY TO A SPECIFIC API
  apiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Api",
  },

  key: {
    type: String,
    required: true,
    unique: true,
  },

  usageCount: {
    type: Number,
    default: 0,
  },

  active: {
    type: Boolean,
    default: true,
  },

  plan: {
    type: String,
    enum: ["free", "pro"],
    default: "free",
  },

  // ⚡ Rate limiting
  limit: {
    type: Number,
    default: 100, // free plan default
  },

  usage: {
    type: Number,
    default: 0,
  },

  resetTime: {
    type: Date,
    default: Date.now,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ApiKey", apiKeySchema);