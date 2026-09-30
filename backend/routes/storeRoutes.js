const express = require("express");

const {
  getAdminStoreSettings,
  updateAdminStoreSettings,
  getPublicStoreSettings,
} = require("../controllers/storeController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router =
  express.Router();

/* =====================================================
   PUBLIC
===================================================== */

router.get(
  "/public",
  getPublicStoreSettings
);

/* =====================================================
   ADMIN
===================================================== */

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminStoreSettings
);

router.patch(
  "/admin",
  protect,
  adminOnly,
  updateAdminStoreSettings
);

module.exports = router;