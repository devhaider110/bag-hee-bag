const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      default: "",
    },

    alt: {
      type: String,
      trim: true,
      default: "",
    },

    publicId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: 240,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    badge: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },

    desktopImage: {
      type: imageSchema,
      default: () => ({
        url: "",
        alt: "",
        publicId: "",
      }),
    },

    mobileImage: {
      type: imageSchema,
      default: () => ({
        url: "",
        alt: "",
        publicId: "",
      }),
    },

    buttonText: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "Shop Now",
    },

    buttonLink: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "/shop",
    },

    linkType: {
      type: String,
      enum: [
        "shop",
        "category",
        "product",
        "custom",
      ],
      default: "shop",
    },

    startAt: {
      type: Date,
      default: null,
    },

    endAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    priority: {
      type: Number,
      default: 0,
      min: 0,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    overlayOpacity: {
      type: Number,
      default: 0.45,
      min: 0,
      max: 1,
    },

    textPosition: {
      type: String,
      enum: [
        "left",
        "center",
        "right",
      ],
      default: "left",
    },

    theme: {
      type: String,
      enum: [
        "dark",
        "light",
        "gold",
        "luxury",
      ],
      default: "luxury",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({
  isActive: 1,
  startAt: 1,
  endAt: 1,
  priority: -1,
  sortOrder: 1,
});

module.exports = mongoose.model(
  "Banner",
  bannerSchema
);