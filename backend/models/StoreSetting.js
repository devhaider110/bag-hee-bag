const mongoose = require("mongoose");

const businessHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },

    open: {
      type: String,
      default: "10:00",
    },

    close: {
      type: String,
      default: "21:00",
    },

    closed: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

/* =====================================================
   SEO SETTINGS
===================================================== */

const seoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default:
        "BAG HEE BAG | Luxury Bags & Handbags",
      trim: true,
      maxlength: 70,
    },

    description: {
      type: String,
      default:
        "Shop luxury handbags, purses, travel bags, school bags and more from BAG HEE BAG.",
      trim: true,
      maxlength: 180,
    },

    keywords: {
      type: String,
      default:
        "BAG HEE BAG, handbags, purses, ladies bags, luxury bags, Mumbai bags",
      trim: true,
      maxlength: 500,
    },

    canonicalUrl: {
      type: String,
      default: "",
      trim: true,
    },

    robots: {
      type: String,
      default: "index, follow",
      trim: true,
    },

    ogTitle: {
      type: String,
      default:
        "BAG HEE BAG | Luxury • Style • Everyday",
      trim: true,
      maxlength: 100,
    },

    ogDescription: {
      type: String,
      default:
        "Discover stylish handbags, purses, travel bags and everyday bags from BAG HEE BAG.",
      trim: true,
      maxlength: 200,
    },

    ogImage: {
      type: String,
      default: "",
      trim: true,
    },

    twitterCard: {
      type: String,
      enum: [
        "summary",
        "summary_large_image",
      ],
      default: "summary_large_image",
    },

    googleSiteVerification: {
      type: String,
      default: "",
      trim: true,
    },

    bingSiteVerification: {
      type: String,
      default: "",
      trim: true,
    },

    schemaType: {
      type: String,
      default: "Store",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

/* =====================================================
   SOCIAL LINKS
===================================================== */

const socialLinksSchema =
  new mongoose.Schema(
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

/* =====================================================
   SYSTEM SETTINGS
===================================================== */

const systemSchema =
  new mongoose.Schema(
    {
      maintenanceMode: {
        type: Boolean,
        default: false,
      },

      maintenanceMessage: {
        type: String,
        default:
          "BAG HEE BAG is temporarily unavailable. We will be back shortly.",
        trim: true,
        maxlength: 500,
      },

      allowGuestCheckout: {
        type: Boolean,
        default: false,
      },

      enableReviews: {
        type: Boolean,
        default: true,
      },

      lowStockThreshold: {
        type: Number,
        default: 5,
        min: 0,
        max: 100000,
      },

      defaultShippingCharge: {
        type: Number,
        default: 0,
        min: 0,
      },

      freeShippingThreshold: {
        type: Number,
        default: 0,
        min: 0,
      },

      orderPrefix: {
        type: String,
        default: "BHB",
        trim: true,
        uppercase: true,
        maxlength: 12,
      },

      invoicePrefix: {
        type: String,
        default: "BHB-INV",
        trim: true,
        uppercase: true,
        maxlength: 20,
      },

      timezone: {
        type: String,
        default: "Asia/Kolkata",
        trim: true,
      },

      dateFormat: {
        type: String,
        default: "DD MMM YYYY",
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

/* =====================================================
   MAIN STORE SETTINGS
===================================================== */

const storeSettingSchema =
  new mongoose.Schema(
    {
      key: {
        type: String,
        unique: true,
        default: "main",
      },

      storeName: {
        type: String,
        required: true,
        default: "BAG HEE BAG",
        trim: true,
      },

      storeCode: {
        type: String,
        default: "BHB",
        trim: true,
        uppercase: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },

      whatsapp: {
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

      gstin: {
        type: String,
        default: "",
        trim: true,
        uppercase: true,
      },

      addressLine1: {
        type: String,
        default:
          "Kothari Milestone, Shop No. 2",
        trim: true,
      },

      addressLine2: {
        type: String,
        default:
          "S.V. Road, Malad West",
        trim: true,
      },

      city: {
        type: String,
        default: "Mumbai",
        trim: true,
      },

      state: {
        type: String,
        default: "Maharashtra",
        trim: true,
      },

      pincode: {
        type: String,
        default: "",
        trim: true,
      },

      country: {
        type: String,
        default: "India",
        trim: true,
      },

      currency: {
        type: String,
        default: "INR",
        uppercase: true,
        trim: true,
      },

      defaultTaxRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      receiptFooter: {
        type: String,
        default:
          "Thank you for shopping with BAG HEE BAG.",
        trim: true,
      },

      businessHours: {
        type: [businessHourSchema],

        default: [
          {
            day: "Monday",
            open: "10:00",
            close: "21:00",
            closed: false,
          },
          {
            day: "Tuesday",
            open: "10:00",
            close: "21:00",
            closed: false,
          },
          {
            day: "Wednesday",
            open: "10:00",
            close: "21:00",
            closed: false,
          },
          {
            day: "Thursday",
            open: "10:00",
            close: "21:00",
            closed: false,
          },
          {
            day: "Friday",
            open: "10:00",
            close: "21:00",
            closed: false,
          },
          {
            day: "Saturday",
            open: "10:00",
            close: "21:00",
            closed: false,
          },
          {
            day: "Sunday",
            open: "10:00",
            close: "21:00",
            closed: false,
          },
        ],
      },

      /* SOCIAL */

      socialLinks: {
        type: socialLinksSchema,
        default: () => ({}),
      },

      /* SEO */

      seo: {
        type: seoSchema,
        default: () => ({}),
      },

      /* SYSTEM */

      system: {
        type: systemSchema,
        default: () => ({}),
      },

      /* BRANDING */

      logoUrl: {
        type: String,
        default: "",
        trim: true,
      },

      faviconUrl: {
        type: String,
        default: "",
        trim: true,
      },

      themeColor: {
        type: String,
        default: "#d4af37",
        trim: true,
      },

      googleMapsUrl: {
        type: String,
        default: "",
        trim: true,
      },

      isActive: {
        type: Boolean,
        default: true,
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

module.exports = mongoose.model(
  "StoreSetting",
  storeSettingSchema
);