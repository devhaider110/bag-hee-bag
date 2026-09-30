const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const shipmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },

    carrier: {
      type: String,
      trim: true,
      default: "",
    },

    trackingNumber: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    trackingUrl: {
      type: String,
      trim: true,
      default: "",
    },

    estimatedDelivery: {
      type: Date,
      default: null,
    },

    pickupAt: {
      type: Date,
      default: null,
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    currentStatus: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
      ],
      default: "ORDER_PLACED",
    },

    timeline: {
      type: [timelineSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shipment", shipmentSchema);