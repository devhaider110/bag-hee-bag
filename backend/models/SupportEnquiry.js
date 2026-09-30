const mongoose = require("mongoose");

const supportEnquirySchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },

    subject: {
      type: String,
      required: [true, "Subject is required."],
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: [true, "Message is required."],
      trim: true,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: [
        "NEW",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED",
      ],
      default: "NEW",
      index: true,
    },

    priority: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
      ],
      default: "MEDIUM",
      index: true,
    },

    category: {
      type: String,
      enum: [
        "GENERAL",
        "PRODUCT",
        "ORDER",
        "PAYMENT",
        "DELIVERY",
        "RETURN",
        "REFUND",
        "ACCOUNT",
        "STORE",
        "OTHER",
      ],
      default: "GENERAL",
      index: true,
    },

    adminReply: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    adminNotes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    repliedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ============================================================
   ENQUIRY NUMBER
============================================================ */

supportEnquirySchema.pre(
  "validate",
  async function (next) {
    try {
      if (this.enquiryNumber) {
        return next();
      }

      const now = new Date();

      const datePart =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

      const randomPart = Math.floor(
        100000 + Math.random() * 900000
      );

      this.enquiryNumber =
        `BHB-SUP-${datePart}-${randomPart}`;

      next();
    } catch (error) {
      next(error);
    }
  }
);

supportEnquirySchema.index({
  createdAt: -1,
});

supportEnquirySchema.index({
  status: 1,
  createdAt: -1,
});

supportEnquirySchema.index({
  email: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "SupportEnquiry",
  supportEnquirySchema
);