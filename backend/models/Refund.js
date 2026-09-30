const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    returnRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReturnRequest",
      required: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    paymentMethod: {
      type: String,
      default: "",
      trim: true,
    },

    refundMethod: {
      type: String,
      enum: [
        "ORIGINAL_PAYMENT",
        "BANK_TRANSFER",
        "UPI",
        "CASH",
        "MANUAL",
        "NA",
      ],
      default: "MANUAL",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "NOT_REQUIRED",
      ],
      default: "PENDING",
      index: true,
    },

    transactionId: {
      type: String,
      default: "",
      trim: true,
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Refund",
  refundSchema
);