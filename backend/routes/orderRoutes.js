const express = require("express");

const {
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  updateShippingDetails,
} = require("../controllers/orderController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* CUSTOMER */

router.get("/my", protect, getMyOrders);

router.get("/my/:id", protect, getMyOrderById);

/* ADMIN */

router.get(
  "/",
  protect,
  adminOnly,
  getAllOrders
);

router.get(
  "/:id",
  protect,
  adminOnly,
  getAdminOrderById
);

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

router.patch(
  "/:id/payment-status",
  protect,
  adminOnly,
  updatePaymentStatus
);

router.patch(
  "/:id/shipping",
  protect,
  adminOnly,
  updateShippingDetails
);

module.exports = router;