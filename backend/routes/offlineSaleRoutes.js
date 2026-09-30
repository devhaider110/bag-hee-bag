const express = require("express");

const {
  getAdminProducts,
  createOfflineSale,
  getOfflineSales,
  getOfflineSaleById,
  getOfflineSummary,
} = require("../controllers/offlineSaleController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
  IMPORTANT:
  Specific routes must stay before /admin/:id
*/

/* PRODUCTS FOR POS */
router.get(
  "/admin/products",
  protect,
  adminOnly,
  getAdminProducts
);

/* TODAY / DATE SUMMARY */
router.get(
  "/admin/summary",
  protect,
  adminOnly,
  getOfflineSummary
);

/* SALES HISTORY */
router.get(
  "/admin",
  protect,
  adminOnly,
  getOfflineSales
);

/* CREATE OFFLINE SALE */
router.post(
  "/admin",
  protect,
  adminOnly,
  createOfflineSale
);

/* SALE DETAILS */
router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getOfflineSaleById
);

module.exports = router;