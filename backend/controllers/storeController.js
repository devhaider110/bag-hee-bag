const StoreSetting = require("../models/StoreSetting");

const DEFAULT_HOURS = [
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
];

/* =====================================================
   ADDRESS
===================================================== */

const getStoreAddress = (store) => {
  return [
    store.addressLine1,
    store.addressLine2,
    store.city,
    store.state,
    store.pincode,
    store.country,
  ]
    .filter(Boolean)
    .join(", ");
};

/* =====================================================
   GET OR CREATE MAIN STORE
===================================================== */

const createDefaultStore = async () => {
  const created =
    await StoreSetting.create({
      key: "main",
      businessHours: DEFAULT_HOURS,
    });

  return created.toObject();
};

const getOrCreateStore = async () => {
  let store =
    await StoreSetting.findOne({
      key: "main",
    }).lean();

  if (!store) {
    store =
      await createDefaultStore();
  }

  return store;
};

/* =====================================================
   PICK SAFE FIELDS
===================================================== */

const pickFields = (
  source,
  fields
) => {
  const result = {};

  fields.forEach((field) => {
    if (
      Object.prototype.hasOwnProperty.call(
        source || {},
        field
      )
    ) {
      result[field] =
        source[field];
    }
  });

  return result;
};

/* =====================================================
   ADMIN - GET SETTINGS
   GET /api/store/admin
===================================================== */

const getAdminStoreSettings =
  async (req, res) => {
    try {
      const store =
        await getOrCreateStore();

      return res.status(200).json({
        success: true,

        store: {
          ...store,

          formattedAddress:
            getStoreAddress(store),
        },
      });
    } catch (error) {
      console.error(
        "Get admin store settings error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load system settings.",
      });
    }
  };

/* =====================================================
   ADMIN - UPDATE SETTINGS
   PATCH /api/store/admin
===================================================== */

const updateAdminStoreSettings =
  async (req, res) => {
    try {
      const body =
        req.body || {};

      const updates =
        pickFields(
          body,
          [
            "storeName",
            "storeCode",
            "phone",
            "whatsapp",
            "email",
            "gstin",
            "addressLine1",
            "addressLine2",
            "city",
            "state",
            "pincode",
            "country",
            "currency",
            "defaultTaxRate",
            "receiptFooter",
            "businessHours",
            "logoUrl",
            "faviconUrl",
            "themeColor",
            "googleMapsUrl",
            "isActive",
          ]
        );

      /* SOCIAL */

      if (body.socialLinks) {
        updates.socialLinks =
          pickFields(
            body.socialLinks,
            [
              "instagram",
              "facebook",
              "youtube",
              "whatsapp",
            ]
          );
      }

      /* SEO */

      if (body.seo) {
        updates.seo =
          pickFields(
            body.seo,
            [
              "title",
              "description",
              "keywords",
              "canonicalUrl",
              "robots",
              "ogTitle",
              "ogDescription",
              "ogImage",
              "twitterCard",
              "googleSiteVerification",
              "bingSiteVerification",
              "schemaType",
            ]
          );
      }

      /* SYSTEM */

      if (body.system) {
        updates.system =
          pickFields(
            body.system,
            [
              "maintenanceMode",
              "maintenanceMessage",
              "allowGuestCheckout",
              "enableReviews",
              "lowStockThreshold",
              "defaultShippingCharge",
              "freeShippingThreshold",
              "orderPrefix",
              "invoicePrefix",
              "timezone",
              "dateFormat",
            ]
          );
      }

      /* TAX */

      if (
        updates.defaultTaxRate !==
        undefined
      ) {
        const taxRate =
          Number(
            updates.defaultTaxRate
          );

        if (
          Number.isNaN(
            taxRate
          ) ||
          taxRate < 0 ||
          taxRate > 100
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Default tax rate must be between 0 and 100.",
          });
        }

        updates.defaultTaxRate =
          taxRate;
      }

      /* SYSTEM NUMBERS */

      if (updates.system) {
        const numericFields = [
          "lowStockThreshold",
          "defaultShippingCharge",
          "freeShippingThreshold",
        ];

        for (const field of numericFields) {
          if (
            updates.system[field] !==
            undefined
          ) {
            const value =
              Number(
                updates.system[field]
              );

            if (
              Number.isNaN(value) ||
              value < 0
            ) {
              return res.status(400).json({
                success: false,
                message:
                  `${field} must be a non-negative number.`,
              });
            }

            updates.system[field] =
              value;
          }
        }
      }

      const store =
        await StoreSetting.findOneAndUpdate(
          {
            key: "main",
          },
          {
            $set: {
              ...updates,

              updatedBy:
                req.user?._id ||
                null,
            },

            $setOnInsert: {
              key: "main",
              businessHours:
                DEFAULT_HOURS,
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );

      return res.status(200).json({
        success: true,

        message:
          "System settings and SEO updated successfully.",

        store: {
          ...store.toObject(),

          formattedAddress:
            getStoreAddress(store),
        },
      });
    } catch (error) {
      console.error(
        "Update admin store settings error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update system settings.",
      });
    }
  };

/* =====================================================
   PUBLIC SETTINGS
   GET /api/store/public
===================================================== */

const getPublicStoreSettings =
  async (req, res) => {
    try {
      const store =
        await getOrCreateStore();

      return res.status(200).json({
        success: true,

        store: {
          storeName:
            store.storeName,

          storeCode:
            store.storeCode,

          phone:
            store.phone,

          whatsapp:
            store.whatsapp,

          email:
            store.email,

          addressLine1:
            store.addressLine1,

          addressLine2:
            store.addressLine2,

          city:
            store.city,

          state:
            store.state,

          pincode:
            store.pincode,

          country:
            store.country,

          currency:
            store.currency,

          businessHours:
            store.businessHours,

          socialLinks:
            store.socialLinks,

          logoUrl:
            store.logoUrl,

          faviconUrl:
            store.faviconUrl,

          themeColor:
            store.themeColor,

          googleMapsUrl:
            store.googleMapsUrl,

          seo:
            store.seo,

          system: {
            maintenanceMode:
              Boolean(
                store.system
                  ?.maintenanceMode
              ),

            maintenanceMessage:
              store.system
                ?.maintenanceMessage ||
              "BAG HEE BAG is temporarily unavailable. We will be back shortly.",
          },

          formattedAddress:
            getStoreAddress(store),
        },
      });
    } catch (error) {
      console.error(
        "Get public store settings error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load store information.",
      });
    }
  };

module.exports = {
  getAdminStoreSettings,
  updateAdminStoreSettings,
  getPublicStoreSettings,
};