const express = require("express");

const {
  getMyRefunds,
  getMyRefundByOrderId,
  getAllRefunds,
  updateRefundStatus,
} = require("../controllers/refundController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// CUSTOMER

router.get(
  "/my",
  protect,
  getMyRefunds
);

router.get(
  "/order/:orderId",
  protect,
  getMyRefundByOrderId
);

// ADMIN

router.get(
  "/admin",
  protect,
  adminOnly,
  getAllRefunds
);

router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateRefundStatus
);

module.exports = router;