const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema(
  {
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

    type: {
      type: String,
      enum: ["CANCELLATION", "RETURN"],
      required: true,
      index: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
        "PICKUP_PENDING",
        "PICKED_UP",
        "RETURNED",
        "REFUND_PENDING",
        "REFUNDED",
      ],
      default: "REQUESTED",
      index: true,
    },

    previousOrderStatus: {
      type: String,
      default: "",
      trim: true,
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
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
      default: "NA",
    },

    refundReference: {
      type: String,
      trim: true,
      default: "",
    },

    adminNote: {
      type: String,
      trim: true,
      default: "",
    },

    processedAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ReturnRequest",
  returnRequestSchema
);