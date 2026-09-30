const mongoose = require("mongoose");

const seoMetaSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: [
        "page",
        "product",
        "category",
      ],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    path: {
      type: String,
      trim: true,
      default: "",
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    title: {
      type: String,
      trim: true,
      maxlength: 70,
      default: "",
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },

    keywords: {
      type: [String],
      default: [],
    },

    ogImage: {
      type: String,
      trim: true,
      default: "",
    },

    canonicalUrl: {
      type: String,
      trim: true,
      default: "",
    },

    robots: {
      type: String,
      trim: true,
      default: "index,follow",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

seoMetaSchema.index({
  entityType: 1,
  entityId: 1,
});

seoMetaSchema.index({
  path: 1,
});

seoMetaSchema.index({
  slug: 1,
});

module.exports = mongoose.model(
  "SeoMeta",
  seoMetaSchema
);