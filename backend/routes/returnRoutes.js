const express = require("express");

const {
  createReturnRequest,
  getMyReturnRequests,
  getMyReturnRequestById,
  getAllReturnRequests,
  getAdminReturnRequestById,
  updateReturnRequest,
} = require("../controllers/returnController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// CUSTOMER
// =====================================================

router.post(
  "/:orderId/cancel",
  protect,
  createReturnRequest
);

router.post(
  "/:orderId/request",
  protect,
  createReturnRequest
);

router.get(
  "/my",
  protect,
  getMyReturnRequests
);

router.get(
  "/my/:id",
  protect,
  getMyReturnRequestById
);

// =====================================================
// ADMIN
// =====================================================

router.get(
  "/admin",
  protect,
  adminOnly,
  getAllReturnRequests
);

router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getAdminReturnRequestById
);

router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateReturnRequest
);

module.exports = router;