const mongoose = require("mongoose");

const SeoMeta = require("../models/SeoMeta");
const Product = require("../models/Product");
const Category = require("../models/Category");

// =====================================================
// HELPERS
// =====================================================

const normalizeEntityType = (
  value
) => {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase();
};

const cleanValue = (
  value
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(
    value
  ).trim();
};

// =====================================================
// SANITIZE SEO PAYLOAD
// =====================================================

const sanitizeSeoPayload = (
  body = {}
) => {
  const entityType =
    normalizeEntityType(
      body.entityType
    );

  let entityId =
    cleanValue(
      body.entityId
    );

  // ---------------------------------------------------
  // PAGE SEO DOES NOT NEED ENTITY ID
  // ---------------------------------------------------

  if (
    entityType ===
    "page"
  ) {
    entityId = null;
  }

  // ---------------------------------------------------
  // PRODUCT / CATEGORY
  // MUST HAVE VALID OBJECT ID
  // ---------------------------------------------------

  if (
    entityType ===
      "product" ||
    entityType ===
      "category"
  ) {
    if (!entityId) {
      return {
        error:
          "Please select a product or category.",
      };
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        entityId
      )
    ) {
      return {
        error:
          "Invalid entity ID.",
      };
    }
  }

  return {
    data: {
      entityType,

      entityId:
        entityId || null,

      path:
        cleanValue(
          body.path
        ),

      slug:
        cleanValue(
          body.slug
        ).toLowerCase(),

      title:
        cleanValue(
          body.title
        ),

      metaDescription:
        cleanValue(
          body.metaDescription
        ),

      keywords:
        Array.isArray(
          body.keywords
        )
          ? body.keywords
              .map(
                (item) =>
                  cleanValue(
                    item
                  )
              )
              .filter(
                Boolean
              )
          : [],

      ogImage:
        cleanValue(
          body.ogImage
        ),

      canonicalUrl:
        cleanValue(
          body.canonicalUrl
        ),

      robots:
        cleanValue(
          body.robots
        ) ||
        "index,follow",

      isActive:
        body.isActive !==
        false,
    },
  };
};

// =====================================================
// GET ADMIN SEO RECORDS
// GET /api/seo/admin
// =====================================================

const getSeoRecords =
  async (
    req,
    res
  ) => {
    try {
      const {
        entityType = "",
        search = "",
      } = req.query;

      const filter = {};

      const normalizedType =
        normalizeEntityType(
          entityType
        );

      if (
        normalizedType &&
        [
          "page",
          "product",
          "category",
        ].includes(
          normalizedType
        )
      ) {
        filter.entityType =
          normalizedType;
      }

      const searchText =
        cleanValue(
          search
        );

      if (searchText) {
        filter.$or = [
          {
            path: {
              $regex:
                searchText,
              $options:
                "i",
            },
          },
          {
            slug: {
              $regex:
                searchText,
              $options:
                "i",
            },
          },
          {
            title: {
              $regex:
                searchText,
              $options:
                "i",
            },
          },
          {
            metaDescription:
              {
                $regex:
                  searchText,
                $options:
                  "i",
              },
          },
        ];
      }

      const records =
        await SeoMeta.find(
          filter
        )
          .sort({
            updatedAt:
              -1,
          })
          .lean();

      return res
        .status(200)
        .json({
          success:
            true,
          records,
        });
    } catch (error) {
      console.error(
        "Get SEO records error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,
          message:
            "Unable to load SEO records.",
        });
    }
  };

// =====================================================
// GET PUBLIC SEO BY PATH
// GET /api/seo/public?path=/
// =====================================================

const getSeoByPath =
  async (
    req,
    res
  ) => {
    try {
      const path =
        cleanValue(
          req.query.path
        );

      if (!path) {
        return res
          .status(200)
          .json({
            success:
              true,
            record:
              null,
          });
      }

      const record =
        await SeoMeta.findOne(
          {
            entityType:
              "page",
            path,
            isActive:
              true,
          }
        ).lean();

      return res
        .status(200)
        .json({
          success:
            true,
          record:
            record ||
            null,
        });
    } catch (error) {
      console.error(
        "Get public SEO error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,
          message:
            "Unable to load SEO metadata.",
        });
    }
  };

// =====================================================
// VERIFY ENTITY EXISTS
// =====================================================

const verifyEntityExists =
  async (
    entityType,
    entityId
  ) => {
    if (
      entityType ===
      "product"
    ) {
      const product =
        await Product.findById(
          entityId
        ).select(
          "_id"
        );

      return Boolean(
        product
      );
    }

    if (
      entityType ===
      "category"
    ) {
      const category =
        await Category.findById(
          entityId
        ).select(
          "_id"
        );

      return Boolean(
        category
      );
    }

    return true;
  };

// =====================================================
// CREATE / UPDATE SEO
// POST /api/seo/admin
// PUT  /api/seo/admin
// =====================================================

const upsertSeo =
  async (
    req,
    res
  ) => {
    try {
      const result =
        sanitizeSeoPayload(
          req.body
        );

      if (
        result.error
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              result.error,
          });
      }

      const payload =
        result.data;

      // -------------------------------------------------
      // BASIC VALIDATION
      // -------------------------------------------------

      if (
        !payload.entityType
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Entity type is required.",
          });
      }

      if (
        ![
          "page",
          "product",
          "category",
        ].includes(
          payload.entityType
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Invalid entity type.",
          });
      }

      // -------------------------------------------------
      // PAGE SEO
      // USES PATH / SLUG
      // -------------------------------------------------

      if (
        payload.entityType ===
        "page"
      ) {
        if (
          !payload.path &&
          !payload.slug
        ) {
          return res
            .status(400)
            .json({
              success:
                false,
              message:
                "Path or slug is required for page SEO.",
            });
        }
      }

      // -------------------------------------------------
      // PRODUCT / CATEGORY SEO
      // -------------------------------------------------

      if (
        payload.entityType ===
          "product" ||
        payload.entityType ===
          "category"
      ) {
        if (
          !payload.entityId
        ) {
          return res
            .status(400)
            .json({
              success:
                false,
              message:
                "Please select a product or category.",
            });
        }

        if (
          !mongoose.Types.ObjectId.isValid(
            payload.entityId
          )
        ) {
          return res
            .status(400)
            .json({
              success:
                false,
              message:
                "Invalid entity ID.",
            });
        }

        // -------------------------------------------------
        // IMPORTANT:
        // MAKE SURE THE SELECTED ENTITY ACTUALLY EXISTS
        // -------------------------------------------------

        const entityExists =
          await verifyEntityExists(
            payload.entityType,
            payload.entityId
          );

        if (
          !entityExists
        ) {
          return res
            .status(404)
            .json({
              success:
                false,
              message:
                payload.entityType ===
                "product"
                  ? "Selected product was not found."
                  : "Selected category was not found.",
            });
        }
      }

      // -------------------------------------------------
      // SEO CONTENT VALIDATION
      // -------------------------------------------------

      if (
        !payload.title &&
        !payload.metaDescription
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "SEO title or meta description is required.",
          });
      }

      // -------------------------------------------------
      // FIND EXISTING RECORD
      // -------------------------------------------------

      let existingRecord =
        null;

      // -------------------------------------------------
      // PAGE SEO
      // -------------------------------------------------

      if (
        payload.entityType ===
        "page"
      ) {
        const pageQuery =
          {
            entityType:
              "page",
          };

        if (
          payload.path
        ) {
          pageQuery.path =
            payload.path;
        } else if (
          payload.slug
        ) {
          pageQuery.slug =
            payload.slug;
        }

        existingRecord =
          await SeoMeta.findOne(
            pageQuery
          );
      }

      // -------------------------------------------------
      // PRODUCT / CATEGORY SEO
      // -------------------------------------------------

      else {
        existingRecord =
          await SeoMeta.findOne(
            {
              entityType:
                payload.entityType,

              entityId:
                payload.entityId,
            }
          );
      }

      // -------------------------------------------------
      // UPDATE EXISTING
      // -------------------------------------------------

      if (
        existingRecord
      ) {
        Object.assign(
          existingRecord,
          payload
        );

        await existingRecord.save();

        return res
          .status(200)
          .json({
            success:
              true,

            message:
              "SEO settings updated successfully.",

            record:
              existingRecord,
          });
      }

      // -------------------------------------------------
      // CREATE NEW
      // -------------------------------------------------

      const record =
        await SeoMeta.create(
          payload
        );

      return res
        .status(201)
        .json({
          success:
            true,

          message:
            "SEO settings saved successfully.",

          record,
        });
    } catch (error) {
      console.error(
        "Save SEO error:",
        error
      );

      // -------------------------------------------------
      // MONGOOSE VALIDATION ERROR
      // -------------------------------------------------

      if (
        error.name ===
        "ValidationError"
      ) {
        const messages =
          Object.values(
            error.errors ||
              {}
          ).map(
            (item) =>
              item.message
          );

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              messages.join(
                ", "
              ) ||
              "Invalid SEO data.",
          });
      }

      // -------------------------------------------------
      // DUPLICATE KEY ERROR
      // -------------------------------------------------

      if (
        error.code ===
        11000
      ) {
        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "An SEO record with these details already exists.",
          });
      }

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to save SEO settings.",
        });
    }
  };

// =====================================================
// DELETE SEO
// DELETE /api/seo/admin/:id
// =====================================================

const deleteSeo =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,
            message:
              "Invalid SEO record ID.",
          });
      }

      const record =
        await SeoMeta.findByIdAndDelete(
          id
        );

      if (!record) {
        return res
          .status(404)
          .json({
            success:
              false,
            message:
              "SEO record not found.",
          });
      }

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "SEO record deleted successfully.",
        });
    } catch (error) {
      console.error(
        "Delete SEO error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to delete SEO record.",
        });
    }
  };

module.exports = {
  getSeoRecords,
  getSeoByPath,
  upsertSeo,
  deleteSeo,
};