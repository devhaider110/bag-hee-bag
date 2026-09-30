const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicket",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    senderType: {
      type: String,
      enum: ["CUSTOMER", "ADMIN", "GUEST"],
      required: true,
    },

    senderSnapshot: {
      name: {
        type: String,
        trim: true,
        default: "",
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },
    },

    message: {
      type: String,
      trim: true,
      required: true,
      maxlength: 5000,
    },

    isInternal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

supportMessageSchema.index({
  ticket: 1,
  createdAt: 1,
});

module.exports = mongoose.model(
  "SupportMessage",
  supportMessageSchema
);