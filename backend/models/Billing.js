const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // optional: track multiple keys
    apiKeys: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ApiKey",
      },
    ],

    totalRequests: {
      type: Number,
      default: 0,
    },

    costPerRequest: {
      type: Number,
      default: 0.01,
    },

    amount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paymentId: String,

    paymentMethod: {
      type: String,
      default: "mock",
    },

    invoiceId: String,

    billingPeriodStart: Date,
    billingPeriodEnd: Date,
  },
  { timestamps: true }
);

// 🔥 auto-calc amount
billingSchema.pre("save", function (next) {
  this.amount = this.totalRequests * this.costPerRequest;
  next();
});

module.exports = mongoose.model("Billing", billingSchema);