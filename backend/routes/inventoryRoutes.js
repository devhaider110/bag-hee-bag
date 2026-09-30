const express = require("express");

const {
  getInventorySummary,
  getInventory,
  getInventoryByProduct,
  updateStock,
  getInventoryMovements,
} = require("../controllers/inventoryController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   MODULE 18 - INVENTORY & STOCK MANAGEMENT
   ADMIN ONLY
===================================================== */

/*
  GET INVENTORY SUMMARY

  GET /api/inventory/admin/summary
*/
router.get(
  "/admin/summary",
  protect,
  adminOnly,
  getInventorySummary
);

/*
  GET INVENTORY LIST

  GET /api/inventory/admin
*/
router.get(
  "/admin",
  protect,
  adminOnly,
  getInventory
);

/*
  GET INVENTORY MOVEMENTS

  GET /api/inventory/admin/movements
*/
router.get(
  "/admin/movements",
  protect,
  adminOnly,
  getInventoryMovements
);

/*
  GET PRODUCT INVENTORY DETAILS

  GET /api/inventory/admin/:productId
*/
router.get(
  "/admin/:productId",
  protect,
  adminOnly,
  getInventoryByProduct
);

/*
  UPDATE PRODUCT / VARIANT STOCK

  PATCH /api/inventory/admin/:productId/stock
*/
router.patch(
  "/admin/:productId/stock",
  protect,
  adminOnly,
  updateStock
);

module.exports = router;