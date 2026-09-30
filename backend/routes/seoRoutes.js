const express = require("express");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getSeoRecords,
  getSeoByPath,
  upsertSeo,
  deleteSeo,
} = require("../controllers/seoController");

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.get(
  "/public",
  getSeoByPath
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
  getSeoRecords
);

router.post(
  "/admin",
  protect,
  adminOnly,
  upsertSeo
);

router.put(
  "/admin",
  protect,
  adminOnly,
  upsertSeo
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteSeo
);

module.exports = router;