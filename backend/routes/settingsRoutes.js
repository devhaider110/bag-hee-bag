const express = require("express");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getAdminSettings,
  updateAdminSettings,
  getPublicSettings,
} = require("../controllers/settingsController");

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.get(
  "/public",
  getPublicSettings
);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminSettings
);

router.put(
  "/admin",
  protect,
  adminOnly,
  updateAdminSettings
);

module.exports = router;