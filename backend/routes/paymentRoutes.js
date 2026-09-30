const express = require("express");

const {
  verifyRazorpayPayment,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/razorpay/verify",
  protect,
  verifyRazorpayPayment
);

module.exports = router;