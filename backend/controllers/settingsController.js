const StoreSetting = require("../models/StoreSetting");

const DEFAULT_SETTINGS = {
  storeName: "BAG HEE BAG",
  tagline: "Luxury • Style • Everyday",
  logo: "",
  email: "",
  phone: "",
  whatsapp: "",

  address: {
    shopName: "BAG HEE BAG",
    building: "Kothari Milestone",
    shopNumber: "Shop No. 2",
    road: "S.V. Road",
    area: "Malad West",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pinCode: "",
  },

  socialLinks: {
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
  },

  paymentSettings: {
    razorpayEnabled: true,
    codEnabled: true,
    codCharge: 0,
  },

  shippingSettings: {
    shippingCharge: 0,
    freeShippingThreshold: 999,
    deliveryZones: [],
  },

  seo: {
    title: "BAG HEE BAG | Luxury Bags & Accessories",
    metaDescription:
      "Shop premium handbags, purses, travel bags, school bags and more at BAG HEE BAG.",
    keywords: [],
    ogImage: "",
    canonicalUrl: "",
    robots: "index,follow",
  },

  taxSettings: {
    gstEnabled: true,
    gstRate: 18,
    invoicePrefix: "BHB-INV",
  },

  maintenanceMode: false,

  maintenanceMessage:
    "We are currently updating our store. Please check back shortly.",
};

const getOrCreateSettings = async () => {
  let settings = await StoreSetting.findOne({
    key: "main",
  });

  if (!settings) {
    settings = await StoreSetting.create({
      key: "main",
      ...DEFAULT_SETTINGS,
    });
  }

  return settings;
};

const cleanString = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
};

const cleanNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const sanitizeSettingsPayload = (body = {}) => {
  const settings = {};

  if (body.storeName !== undefined) {
    settings.storeName = cleanString(
      body.storeName
    );
  }

  if (body.tagline !== undefined) {
    settings.tagline = cleanString(
      body.tagline
    );
  }

  if (body.logo !== undefined) {
    settings.logo = cleanString(body.logo);
  }

  if (body.email !== undefined) {
    settings.email = cleanString(body.email);
  }

  if (body.phone !== undefined) {
    settings.phone = cleanString(body.phone);
  }

  if (body.whatsapp !== undefined) {
    settings.whatsapp = cleanString(
      body.whatsapp
    );
  }

  if (body.address) {
    settings.address = {
      shopName: cleanString(
        body.address.shopName
      ),
      building: cleanString(
        body.address.building
      ),
      shopNumber: cleanString(
        body.address.shopNumber
      ),
      road: cleanString(body.address.road),
      area: cleanString(body.address.area),
      city: cleanString(body.address.city),
      state: cleanString(
        body.address.state
      ),
      country: cleanString(
        body.address.country
      ),
      pinCode: cleanString(
        body.address.pinCode
      ),
    };
  }

  if (body.socialLinks) {
    settings.socialLinks = {
      instagram: cleanString(
        body.socialLinks.instagram
      ),
      facebook: cleanString(
        body.socialLinks.facebook
      ),
      youtube: cleanString(
        body.socialLinks.youtube
      ),
      linkedin: cleanString(
        body.socialLinks.linkedin
      ),
    };
  }

  if (body.paymentSettings) {
    settings.paymentSettings = {
      razorpayEnabled:
        body.paymentSettings.razorpayEnabled ===
        true,

      codEnabled:
        body.paymentSettings.codEnabled === true,

      codCharge: cleanNumber(
        body.paymentSettings.codCharge,
        0
      ),
    };
  }

  if (body.shippingSettings) {
    settings.shippingSettings = {
      shippingCharge: cleanNumber(
        body.shippingSettings.shippingCharge,
        0
      ),

      freeShippingThreshold:
        cleanNumber(
          body.shippingSettings
            .freeShippingThreshold,
          999
        ),

      deliveryZones: Array.isArray(
        body.shippingSettings.deliveryZones
      )
        ? body.shippingSettings.deliveryZones
            .map((zone) => ({
              name: cleanString(zone.name),
              charge: cleanNumber(
                zone.charge,
                0
              ),
              estimatedDays:
                cleanString(
                  zone.estimatedDays
                ) || "3-7 days",
              isActive:
                zone.isActive !== false,
            }))
            .filter((zone) => zone.name)
        : [],
    };
  }

  if (body.seo) {
    settings.seo = {
      title: cleanString(
        body.seo.title
      ),

      metaDescription: cleanString(
        body.seo.metaDescription
      ),

      keywords: Array.isArray(
        body.seo.keywords
      )
        ? body.seo.keywords
            .map((keyword) =>
              String(keyword).trim()
            )
            .filter(Boolean)
        : [],

      ogImage: cleanString(
        body.seo.ogImage
      ),

      canonicalUrl: cleanString(
        body.seo.canonicalUrl
      ),

      robots:
        cleanString(body.seo.robots) ||
        "index,follow",
    };
  }

  if (body.taxSettings) {
    settings.taxSettings = {
      gstEnabled:
        body.taxSettings.gstEnabled === true,

      gstRate: cleanNumber(
        body.taxSettings.gstRate,
        18
      ),

      invoicePrefix:
        cleanString(
          body.taxSettings.invoicePrefix
        ) || "BHB-INV",
    };
  }

  if (body.maintenanceMode !== undefined) {
    settings.maintenanceMode =
      body.maintenanceMode === true;
  }

  if (
    body.maintenanceMessage !==
    undefined
  ) {
    settings.maintenanceMessage =
      cleanString(
        body.maintenanceMessage
      );
  }

  return settings;
};

/*
|--------------------------------------------------------------------------
| ADMIN - GET SETTINGS
|--------------------------------------------------------------------------
*/

const getAdminSettings = async (
  req,
  res
) => {
  try {
    const settings =
      await getOrCreateSettings();

    return res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(
      "Get admin settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load store settings.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE SETTINGS
|--------------------------------------------------------------------------
*/

const updateAdminSettings = async (
  req,
  res
) => {
  try {
    const payload =
      sanitizeSettingsPayload(
        req.body
      );

    const settings =
      await StoreSetting.findOneAndUpdate(
        { key: "main" },
        {
          $set: payload,
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

    return res.json({
      success: true,
      message:
        "Store settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error(
      "Update admin settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update store settings.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| PUBLIC - GET SETTINGS
|--------------------------------------------------------------------------
|
| Only public/non-sensitive information is returned.
| Never expose payment secrets or admin-only data here.
|--------------------------------------------------------------------------
*/

const getPublicSettings = async (
  req,
  res
) => {
  try {
    const settings =
      await getOrCreateSettings();

    return res.json({
      success: true,

      settings: {
        storeName:
          settings.storeName,

        tagline:
          settings.tagline,

        logo:
          settings.logo,

        email:
          settings.email,

        phone:
          settings.phone,

        whatsapp:
          settings.whatsapp,

        address:
          settings.address,

        socialLinks:
          settings.socialLinks,

        paymentSettings: {
          razorpayEnabled:
            settings.paymentSettings
              .razorpayEnabled,

          codEnabled:
            settings.paymentSettings
              .codEnabled,

          codCharge:
            settings.paymentSettings
              .codCharge,
        },

        shippingSettings:
          settings.shippingSettings,

        seo:
          settings.seo,

        taxSettings: {
          gstEnabled:
            settings.taxSettings
              .gstEnabled,

          gstRate:
            settings.taxSettings.gstRate,
        },

        maintenanceMode:
          settings.maintenanceMode,

        maintenanceMessage:
          settings.maintenanceMessage,
      },
    });
  } catch (error) {
    console.error(
      "Get public settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load store settings.",
    });
  }
};

module.exports = {
  getAdminSettings,
  updateAdminSettings,
  getPublicSettings,
};