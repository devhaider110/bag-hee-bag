const mongoose = require("mongoose");
const Banner = require("../models/Banner");

/* =========================================================
   HELPERS
========================================================= */

const normalizeImage = (image = {}) => {
  if (!image) {
    return {
      url: "",
      alt: "",
      publicId: "",
    };
  }

  return {
    url: image.url || "",
    alt: image.alt || "",
    publicId: image.publicId || "",
  };
};

const normalizeBannerPayload = (body = {}) => {
  return {
    title: body.title || "",
    subtitle: body.subtitle || "",
    description: body.description || "",
    badge: body.badge || "",

    buttonText: body.buttonText || "",
    buttonLink: body.buttonLink || "",
    linkType: body.linkType || "custom",

    desktopImage: normalizeImage(body.desktopImage),
    mobileImage: normalizeImage(body.mobileImage),

    startAt: body.startAt || null,
    endAt: body.endAt || null,

    isActive:
      body.isActive === undefined
        ? true
        : Boolean(body.isActive),

    priority:
      body.priority !== undefined
        ? Number(body.priority)
        : 0,

    sortOrder:
      body.sortOrder !== undefined
        ? Number(body.sortOrder)
        : 0,

    overlayOpacity:
      body.overlayOpacity !== undefined
        ? Number(body.overlayOpacity)
        : 0.35,

    textPosition: body.textPosition || "left",

    theme: body.theme || "dark",
  };
};

/* =========================================================
   CLOUDINARY BUFFER UPLOAD
========================================================= */

const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    try {
      if (!buffer) {
        reject(new Error("Image buffer is missing."));
        return;
      }

      /*
       * Import Cloudinary directly here.
       * This guarantees that we are using the actual v2 instance.
       */
      const { v2: cloudinary } = require("cloudinary");

      console.log("Cloudinary upload check:", {
        cloudinaryExists: !!cloudinary,
        uploaderExists: !!cloudinary?.uploader,
        uploadStreamType:
          typeof cloudinary?.uploader?.upload_stream,
      });

      if (!cloudinary) {
        reject(
          new Error(
            "Cloudinary v2 instance could not be loaded."
          )
        );
        return;
      }

      if (!cloudinary.uploader) {
        reject(
          new Error(
            "Cloudinary uploader is unavailable."
          )
        );
        return;
      }

      if (
        typeof cloudinary.uploader.upload_stream !==
        "function"
      ) {
        reject(
          new Error(
            "Cloudinary upload_stream is unavailable."
          )
        );
        return;
      }

      /*
       * Configure Cloudinary from environment variables.
       */
      cloudinary.config({
        cloud_name:
          process.env.CLOUDINARY_CLOUD_NAME,

        api_key:
          process.env.CLOUDINARY_API_KEY,

        api_secret:
          process.env.CLOUDINARY_API_SECRET,
      });

      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder: "bhb/banners",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              console.error(
                "Cloudinary upload_stream error:",
                error
              );

              reject(error);
              return;
            }

            if (!result) {
              reject(
                new Error(
                  "Cloudinary returned an empty upload result."
                )
              );

              return;
            }

            resolve(result);
          }
        );

      uploadStream.end(buffer);
    } catch (error) {
      console.error(
        "Cloudinary upload setup error:",
        error
      );

      reject(error);
    }
  });
};

/* =========================================================
   CUSTOMER
   GET ACTIVE BANNERS
========================================================= */

const getActiveBanners = async (req, res) => {
  try {
    const now = new Date();

    const banners = await Banner.find({
      isActive: true,

      $and: [
        {
          $or: [
            {
              startAt: null,
            },
            {
              startAt: {
                $lte: now,
              },
            },
          ],
        },

        {
          $or: [
            {
              endAt: null,
            },
            {
              endAt: {
                $gte: now,
              },
            },
          ],
        },
      ],
    })
      .sort({
        priority: -1,
        sortOrder: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error(
      "Get active banners error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load active banners.",
    });
  }
};

/* =========================================================
   ADMIN
   GET ALL BANNERS
========================================================= */

const getAllBanners = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },

        {
          subtitle: {
            $regex: search.trim(),
            $options: "i",
          },
        },

        {
          badge: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (status === "active") {
      query.isActive = true;
    }

    if (status === "inactive") {
      query.isActive = false;
    }

    const banners = await Banner.find(query)
      .sort({
        priority: -1,
        sortOrder: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error(
      "Get admin banners error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load banners.",
    });
  }
};

/* =========================================================
   ADMIN
   GET BANNER BY ID
========================================================= */

const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID.",
      });
    }

    const banner = await Banner.findById(id).lean();

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found.",
      });
    }

    return res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error(
      "Get banner by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load banner.",
    });
  }
};

/* =========================================================
   ADMIN
   UPLOAD BANNER IMAGE
========================================================= */

const uploadBannerImage = async (req, res) => {
  try {
    console.log(
      "Banner upload request received."
    );

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    console.log("Uploaded file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    if (
      !req.file.mimetype ||
      !req.file.mimetype.startsWith("image/")
    ) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed.",
      });
    }

    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Uploaded image data is missing.",
      });
    }

    const result =
      await uploadBufferToCloudinary(
        req.file.buffer
      );

    return res.status(200).json({
      success: true,
      message:
        "Banner image uploaded successfully.",

      image: {
        url:
          result.secure_url ||
          result.url ||
          "",

        publicId:
          result.public_id ||
          "",

        width:
          result.width ||
          null,

        height:
          result.height ||
          null,

        format:
          result.format ||
          "",

        bytes:
          result.bytes ||
          0,
      },
    });
  } catch (error) {
    console.error(
      "Banner image upload error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to upload banner image.",
    });
  }
};

/* =========================================================
   ADMIN
   CREATE BANNER
========================================================= */

const createBanner = async (req, res) => {
  try {
    const payload =
      normalizeBannerPayload(req.body);

    if (!payload.title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner title is required.",
      });
    }

    const banner =
      await Banner.create(payload);

    return res.status(201).json({
      success: true,
      message:
        "Banner created successfully.",
      banner,
    });
  } catch (error) {
    console.error(
      "Create banner error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create banner.",
    });
  }
};

/* =========================================================
   ADMIN
   UPDATE BANNER
========================================================= */

const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID.",
      });
    }

    const banner =
      await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found.",
      });
    }

    const payload =
      normalizeBannerPayload(req.body);

    Object.assign(
      banner,
      payload
    );

    await banner.save();

    return res.status(200).json({
      success: true,
      message:
        "Banner updated successfully.",
      banner,
    });
  } catch (error) {
    console.error(
      "Update banner error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update banner.",
    });
  }
};

/* =========================================================
   ADMIN
   TOGGLE STATUS
========================================================= */

const toggleBannerStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID.",
      });
    }

    const banner =
      await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found.",
      });
    }

    banner.isActive =
      !banner.isActive;

    await banner.save();

    return res.status(200).json({
      success: true,

      message: banner.isActive
        ? "Banner activated successfully."
        : "Banner deactivated successfully.",

      banner,
    });
  } catch (error) {
    console.error(
      "Toggle banner status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update banner status.",
    });
  }
};

/* =========================================================
   ADMIN
   DELETE BANNER
========================================================= */

const deleteBanner = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID.",
      });
    }

    const banner =
      await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found.",
      });
    }

    await Banner.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Banner deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete banner error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete banner.",
    });
  }
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  uploadBannerImage,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  deleteBanner,
};