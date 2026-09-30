const express = require("express");

const {
  getStoreSettings,
  updateStoreSettings,
  getStoreProducts,
  createOfflineSale,
  getOfflineSales,
  getOfflineSaleById,
  getPhysicalStoreDashboard,
} = require("../controllers/physicalStoreController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   PUBLIC STORE INFORMATION
===================================================== */

router.get(
  "/store",
  getStoreSettings
);

/* =====================================================
   ADMIN STORE MANAGEMENT
===================================================== */

router.patch(
  "/admin/store",
  protect,
  adminOnly,
  updateStoreSettings
);

/* =====================================================
   ADMIN PRODUCTS FOR PHYSICAL STORE
===================================================== */

router.get(
  "/admin/products",
  protect,
  adminOnly,
  getStoreProducts
);

/* =====================================================
   ADMIN DASHBOARD
===================================================== */

router.get(
  "/admin/dashboard",
  protect,
  adminOnly,
  getPhysicalStoreDashboard
);

/* =====================================================
   OFFLINE SALES
===================================================== */

router.get(
  "/admin/sales",
  protect,
  adminOnly,
  getOfflineSales
);

router.post(
  "/admin/sales",
  protect,
  adminOnly,
  createOfflineSale
);

router.get(
  "/admin/sales/:id",
  protect,
  adminOnly,
  getOfflineSaleById
);

module.exports = router;