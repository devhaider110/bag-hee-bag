const express = require("express");

const {
  prepareCheckout,
  createRazorpayOrder,
  createCODOrder,
} = require("../controllers/checkoutController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/prepare",
  protect,
  prepareCheckout
);

router.post(
  "/razorpay/order",
  protect,
  createRazorpayOrder
);

router.post(
  "/cod",
  protect,
  createCODOrder
);

module.exports = router;