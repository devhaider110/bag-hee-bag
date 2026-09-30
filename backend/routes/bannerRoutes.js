const express = require("express");

const {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  deleteBanner,
  uploadBannerImage,
} = require("../controllers/bannerController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  uploadBannerImage:
    uploadBannerImageMiddleware,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

/* =====================================================
   PUBLIC
===================================================== */

router.get(
  "/active",
  getActiveBanners
);

/* =====================================================
   ADMIN - IMAGE UPLOAD
===================================================== */

router.post(
  "/admin/upload",
  protect,
  adminOnly,
  uploadBannerImageMiddleware,
  uploadBannerImage
);

/* =====================================================
   ADMIN - LIST
===================================================== */

router.get(
  "/admin",
  protect,
  adminOnly,
  getAllBanners
);

/* =====================================================
   ADMIN - SINGLE
===================================================== */

router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getBannerById
);

/* =====================================================
   ADMIN - CREATE
===================================================== */

router.post(
  "/admin",
  protect,
  adminOnly,
  createBanner
);

/* =====================================================
   ADMIN - UPDATE
===================================================== */

router.patch(
  "/admin/:id",
  protect,
  adminOnly,
  updateBanner
);

/* =====================================================
   ADMIN - TOGGLE
===================================================== */

router.patch(
  "/admin/:id/toggle",
  protect,
  adminOnly,
  toggleBannerStatus
);

/* =====================================================
   ADMIN - DELETE
===================================================== */

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteBanner
);

module.exports = router;