const express = require("express");

const {
  getMyTracking,
  getAdminShipping,
  updateShippingInfo,
  updateShippingStatus,
} = require("../controllers/shippingController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// CUSTOMER
// ============================================================

router.get(
  "/my/:orderId",
  protect,
  getMyTracking
);

// ============================================================
// ADMIN
// ============================================================

router.get(
  "/admin/:orderId",
  protect,
  adminOnly,
  getAdminShipping
);

router.patch(
  "/admin/:orderId/info",
  protect,
  adminOnly,
  updateShippingInfo
);

router.patch(
  "/admin/:orderId/status",
  protect,
  adminOnly,
  updateShippingStatus
);

module.exports = router;