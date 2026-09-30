const express = require("express");

const {
  getReportSummary,
  getSalesReport,
  getProductReport,
  getCategoryReport,
  getCustomerReport,
} = require("../controllers/reportController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   MODULE 20
   ADMIN REPORT ROUTES
===================================================== */

/* -----------------------------------------------------
   REPORT SUMMARY
   GET /api/reports/summary
----------------------------------------------------- */

router.get(
  "/summary",
  protect,
  adminOnly,
  getReportSummary
);

/* -----------------------------------------------------
   SALES REPORT
   GET /api/reports/sales
----------------------------------------------------- */

router.get(
  "/sales",
  protect,
  adminOnly,
  getSalesReport
);

/* -----------------------------------------------------
   PRODUCT REPORT
   GET /api/reports/products
----------------------------------------------------- */

router.get(
  "/products",
  protect,
  adminOnly,
  getProductReport
);

/* -----------------------------------------------------
   CATEGORY REPORT
   GET /api/reports/categories
----------------------------------------------------- */

router.get(
  "/categories",
  protect,
  adminOnly,
  getCategoryReport
);

/* -----------------------------------------------------
   CUSTOMER REPORT
   GET /api/reports/customers
----------------------------------------------------- */

router.get(
  "/customers",
  protect,
  adminOnly,
  getCustomerReport
);

module.exports = router;