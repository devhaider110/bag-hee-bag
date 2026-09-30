const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    type: {
      type: String,
      enum: [
        "INITIAL",
        "RESTOCK",
        "SALE",
        "RETURN",
        "CANCELLATION",
        "ADJUSTMENT",
      ],
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },

    newStock: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    referenceType: {
      type: String,
      enum: [
        "ORDER",
        "RETURN",
        "CANCELLATION",
        "MANUAL",
        "SYSTEM",
      ],
      default: "MANUAL",
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({
  product: 1,
  createdAt: -1,
});

inventorySchema.index({
  type: 1,
  createdAt: -1,
});

inventorySchema.index({
  performedBy: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Inventory",
  inventorySchema
);