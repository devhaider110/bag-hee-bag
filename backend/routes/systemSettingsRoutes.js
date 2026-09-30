const express = require("express");

const {
  getAdminSystemSettings,
  updateAdminSystemSettings,
  getPublicSystemSettings,
  updateProductSEO,
  updateCategorySEO,
} = require("../controllers/systemSettingsController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router =
  express.Router();

router.get(
  "/public",
  getPublicSystemSettings
);

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminSystemSettings
);

router.patch(
  "/admin",
  protect,
  adminOnly,
  updateAdminSystemSettings
);

router.patch(
  "/admin/products/:id/seo",
  protect,
  adminOnly,
  updateProductSEO
);

router.patch(
  "/admin/categories/:id/seo",
  protect,
  adminOnly,
  updateCategorySEO
);

module.exports = router;