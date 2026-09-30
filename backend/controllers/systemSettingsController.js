const mongoose = require("mongoose");

const SystemSetting = require("../models/SystemSetting");
const Product = require("../models/Product");
const Category = require("../models/Category");

const DEFAULT_SETTINGS = {
  storeName: "BAG HEE BAG",

  logoUrl: "",

  email: "",

  phone: "",

  address:
    "Kothari Milestone, Shop No. 2, S.V. Road, Malad West, Mumbai, Maharashtra, India",

  socialLinks: {
    instagram: "",
    facebook: "",
    youtube: "",
    whatsapp: "",
  },

  paymentSettings: {
    razorpayEnabled: true,
    codEnabled: true,
    codCharge: 0,
  },

  shippingSettings: {
    shippingCharge: 0,
    freeShippingThreshold: 0,
    deliveryZones: [
      "Mumbai",
      "Maharashtra",
      "India",
    ],
  },

  seo: {
    siteTitle:
      "BAG HEE BAG | Luxury Bags & Accessories",

    metaDescription:
      "BAG HEE BAG — premium handbags, travel bags, school bags, men's bags and more. Shop online or visit our Malad West store.",

    keywords: [
      "BAG HEE BAG",
      "bags",
      "handbags",
      "ladies bags",
      "travel bags",
      "Mumbai bags",
    ],

    ogImage: "",

    canonicalUrl: "",

    robots: "index,follow",

    googleAnalyticsId: "",
  },

  maintenanceMode: false,

  announcementText: "",
};

const ensureSettings = async () => {
  let settings = await SystemSetting.findOne({
    key: "main",
  });

  if (!settings) {
    settings = await SystemSetting.create({
      key: "main",
      ...DEFAULT_SETTINGS,
    });
  }

  return settings;
};

const getAdminSystemSettings = async (
  req,
  res
) => {
  try {
    const settings =
      await ensureSettings();

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(
      "Get system settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load system settings.",
    });
  }
};

const updateAdminSystemSettings = async (
  req,
  res
) => {
  try {
    const allowedFields = [
      "storeName",
      "logoUrl",
      "email",
      "phone",
      "address",
      "socialLinks",
      "paymentSettings",
      "shippingSettings",
      "seo",
      "maintenanceMode",
      "announcementText",
    ];

    const updates = {};

    allowedFields.forEach(
      (field) => {
        if (
          Object.prototype.hasOwnProperty.call(
            req.body || {},
            field
          )
        ) {
          updates[field] =
            req.body[field];
        }
      }
    );

    if (updates.paymentSettings) {
      updates.paymentSettings = {
        ...DEFAULT_SETTINGS.paymentSettings,
        ...updates.paymentSettings,
      };

      const codCharge = Number(
        updates.paymentSettings.codCharge
      );

      if (
        !Number.isFinite(
          codCharge
        ) ||
        codCharge < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "COD charge must be a valid non-negative number.",
        });
      }

      updates.paymentSettings.codCharge =
        codCharge;
    }

    if (updates.shippingSettings) {
      updates.shippingSettings = {
        ...DEFAULT_SETTINGS.shippingSettings,
        ...updates.shippingSettings,
      };

      const shippingCharge =
        Number(
          updates.shippingSettings
            .shippingCharge
        );

      const freeShippingThreshold =
        Number(
          updates.shippingSettings
            .freeShippingThreshold
        );

      if (
        !Number.isFinite(
          shippingCharge
        ) ||
        shippingCharge < 0 ||
        !Number.isFinite(
          freeShippingThreshold
        ) ||
        freeShippingThreshold < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Shipping values must be valid non-negative numbers.",
        });
      }

      updates.shippingSettings.shippingCharge =
        shippingCharge;

      updates.shippingSettings.freeShippingThreshold =
        freeShippingThreshold;

      if (
        !Array.isArray(
          updates.shippingSettings
            .deliveryZones
        )
      ) {
        updates.shippingSettings.deliveryZones =
          [];
      }
    }

    if (updates.seo) {
      updates.seo = {
        ...DEFAULT_SETTINGS.seo,
        ...updates.seo,
      };

      if (
        !Array.isArray(
          updates.seo.keywords
        )
      ) {
        updates.seo.keywords = [];
      }

      updates.seo.keywords =
        updates.seo.keywords
          .map((keyword) =>
            String(keyword).trim()
          )
          .filter(Boolean)
          .slice(0, 30);
    }

    const settings =
      await SystemSetting.findOneAndUpdate(
        {
          key: "main",
        },
        {
          $set: updates,

          $setOnInsert: {
            key: "main",
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "System settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error(
      "Update system settings error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to update system settings.",
    });
  }
};

const getPublicSystemSettings = async (
  req,
  res
) => {
  try {
    const settings =
      await ensureSettings();

    return res.status(200).json({
      success: true,

      settings: {
        storeName:
          settings.storeName,

        logoUrl:
          settings.logoUrl,

        email:
          settings.email,

        phone:
          settings.phone,

        address:
          settings.address,

        socialLinks:
          settings.socialLinks,

        paymentSettings: {
          razorpayEnabled:
            settings.paymentSettings
              ?.razorpayEnabled ??
            true,

          codEnabled:
            settings.paymentSettings
              ?.codEnabled ??
            true,

          codCharge:
            settings.paymentSettings
              ?.codCharge ??
            0,
        },

        shippingSettings:
          settings.shippingSettings,

        seo:
          settings.seo,

        maintenanceMode:
          settings.maintenanceMode,

        announcementText:
          settings.announcementText,
      },
    });
  } catch (error) {
    console.error(
      "Get public system settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load public system settings.",
    });
  }
};

const normalizeSEO = (
  seo = {}
) => ({
  title: String(
    seo.title || ""
  )
    .trim()
    .slice(0, 160),

  metaDescription:
    String(
      seo.metaDescription || ""
    )
      .trim()
      .slice(0, 320),

  keywords:
    Array.isArray(
      seo.keywords
    )
      ? seo.keywords
          .map((keyword) =>
            String(keyword).trim()
          )
          .filter(Boolean)
          .slice(0, 30)
      : [],

  slug: String(
    seo.slug || ""
  )
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .slice(0, 140),

  ogImage: String(
    seo.ogImage || ""
  ).trim(),
});

const updateProductSEO = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });
    }

    const seo =
      normalizeSEO(
        req.body?.seo
      );

    if (!seo.slug) {
      return res.status(400).json({
        success: false,
        message:
          "Product SEO slug is required.",
      });
    }

    const duplicate =
      await Product.findOne({
        _id: {
          $ne: id,
        },

        "seo.slug":
          seo.slug,
      }).select(
        "_id name"
      );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "This SEO slug is already used by another product.",
      });
    }

    const product =
      await Product.findByIdAndUpdate(
        id,
        {
          $set: {
            seo,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "category",
        "name slug"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product SEO updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error(
      "Update product SEO error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to update product SEO.",
    });
  }
};

const updateCategorySEO = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid category ID.",
      });
    }

    const seo =
      normalizeSEO(
        req.body?.seo
      );

    if (!seo.slug) {
      return res.status(400).json({
        success: false,
        message:
          "Category SEO slug is required.",
      });
    }

    const duplicate =
      await Category.findOne({
        _id: {
          $ne: id,
        },

        "seo.slug":
          seo.slug,
      }).select(
        "_id name"
      );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "This SEO slug is already used by another category.",
      });
    }

    const category =
      await Category.findByIdAndUpdate(
        id,
        {
          $set: {
            seo,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Category SEO updated successfully.",
      data: category,
    });
  } catch (error) {
    console.error(
      "Update category SEO error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to update category SEO.",
    });
  }
};

module.exports = {
  getAdminSystemSettings,
  updateAdminSystemSettings,
  getPublicSystemSettings,
  updateProductSEO,
  updateCategorySEO,
};