const mongoose = require("mongoose");

const socialLinksSchema = new mongoose.Schema(
  {
    instagram: {
      type: String,
      default: "",
      trim: true,
    },

    facebook: {
      type: String,
      default: "",
      trim: true,
    },

    youtube: {
      type: String,
      default: "",
      trim: true,
    },

    whatsapp: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const paymentSettingsSchema = new mongoose.Schema(
  {
    razorpayEnabled: {
      type: Boolean,
      default: true,
    },

    codEnabled: {
      type: Boolean,
      default: true,
    },

    codCharge: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const shippingSettingsSchema = new mongoose.Schema(
  {
    shippingCharge: {
      type: Number,
      min: 0,
      default: 0,
    },

    freeShippingThreshold: {
      type: Number,
      min: 0,
      default: 0,
    },

    deliveryZones: {
      type: [String],
      default: [
        "Mumbai",
        "Maharashtra",
        "India",
      ],
    },
  },
  {
    _id: false,
  }
);

const seoSettingsSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      default:
        "BAG HEE BAG | Luxury Bags & Accessories",
      trim: true,
      maxlength: 160,
    },

    metaDescription: {
      type: String,
      default:
        "BAG HEE BAG — premium handbags, travel bags, school bags, men's bags and more. Shop online or visit our Malad West store.",
      trim: true,
      maxlength: 320,
    },

    keywords: {
      type: [String],
      default: [
        "BAG HEE BAG",
        "bags",
        "handbags",
        "ladies bags",
        "travel bags",
        "Mumbai bags",
      ],
    },

    ogImage: {
      type: String,
      default: "",
      trim: true,
    },

    canonicalUrl: {
      type: String,
      default: "",
      trim: true,
    },

    robots: {
      type: String,
      enum: [
        "index,follow",
        "noindex,nofollow",
        "index,nofollow",
        "noindex,follow",
      ],
      default: "index,follow",
    },

    googleAnalyticsId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "main",
      trim: true,
    },

    storeName: {
      type: String,
      default: "BAG HEE BAG",
      trim: true,
      maxlength: 120,
    },

    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default:
        "Kothari Milestone, Shop No. 2, S.V. Road, Malad West, Mumbai, Maharashtra, India",
      trim: true,
    },

    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },

    paymentSettings: {
      type: paymentSettingsSchema,
      default: () => ({}),
    },

    shippingSettings: {
      type: shippingSettingsSchema,
      default: () => ({}),
    },

    seo: {
      type: seoSettingsSchema,
      default: () => ({}),
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    announcementText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SystemSetting",
  systemSettingSchema
);