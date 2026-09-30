const crypto = require("crypto");

const {
  buildCheckoutData,
  createOrderFromCheckout,
} = require("./checkoutController");

// ==============================
// VERIFY RAZORPAY PAYMENT
// ==============================
const verifyRazorpayPayment = async (
  req,
  res
) => {
  try {
    const {
      addressId,
      couponCode,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Incomplete payment information.",
      });
    }

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verification failed.",
      });
    }

    const checkoutData =
      await buildCheckoutData(
        req.user._id,
        addressId,
        couponCode
      );

    const order =
      await createOrderFromCheckout(
        req.user._id,
        checkoutData,
        {
          paymentMethod: "RAZORPAY",
          paymentStatus: "PAID",
          razorpayOrderId:
            razorpay_order_id,
          razorpayPaymentId:
            razorpay_payment_id,
          razorpaySignature:
            razorpay_signature,
        }
      );

    res.status(201).json({
      success: true,
      message:
        "Payment verified and order placed successfully.",
      order: {
        _id: order._id,
        totalAmount:
          order.totalAmount,
        paymentMethod:
          order.paymentMethod,
        paymentStatus:
          order.paymentStatus,
        orderStatus:
          order.orderStatus,
        createdAt:
          order.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Payment verification failed.",
    });
  }
};

module.exports = {
  verifyRazorpayPayment,
};