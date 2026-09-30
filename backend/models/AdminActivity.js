const mongoose = require("mongoose");

const adminActivitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    actorName: {
      type: String,
      trim: true,
      default: "",
    },

    actorEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    category: {
      type: String,
      enum: [
        "AUTH",
        "USER",
        "ROLE",
        "PERMISSION",
        "SECURITY",
        "SYSTEM",
      ],
      default: "SECURITY",
    },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    targetUserName: {
      type: String,
      trim: true,
      default: "",
    },

    targetUserEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    ipAddress: {
      type: String,
      trim: true,
      default: "",
    },

    userAgent: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

adminActivitySchema.index({
  createdAt: -1,
});

adminActivitySchema.index({
  actor: 1,
  createdAt: -1,
});

adminActivitySchema.index({
  category: 1,
  createdAt: -1,
});

adminActivitySchema.index({
  targetUser: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "AdminActivity",
  adminActivitySchema
);