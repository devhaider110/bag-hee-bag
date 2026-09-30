const express = require("express");

const {
  getDashboardSummary,
  getSalesAnalytics,
  getOrderAnalytics,
  getProductAnalytics,
  getCategoryAnalytics,
  getCustomerAnalytics,
  getDashboardActivity,
} = require("../controllers/adminDashboardController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   MODULE 19
   ADMIN DASHBOARD & ANALYTICS

   ALL ROUTES ARE ADMIN ONLY
===================================================== */

router.get(
  "/summary",
  protect,
  adminOnly,
  getDashboardSummary
);

router.get(
  "/sales",
  protect,
  adminOnly,
  getSalesAnalytics
);

router.get(
  "/orders",
  protect,
  adminOnly,
  getOrderAnalytics
);

router.get(
  "/products",
  protect,
  adminOnly,
  getProductAnalytics
);

router.get(
  "/categories",
  protect,
  adminOnly,
  getCategoryAnalytics
);

router.get(
  "/customers",
  protect,
  adminOnly,
  getCustomerAnalytics
);

router.get(
  "/activity",
  protect,
  adminOnly,
  getDashboardActivity
);

module.exports = router;