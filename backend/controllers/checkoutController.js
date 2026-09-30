const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Address = require("../models/Address");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const CouponUsage = require("../models/CouponUsage");
const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification");

const razorpay = require("../config/razorpay");
const { sendOrderConfirmationEmail } = require("../config/mailer");

const FREE_SHIPPING_LIMIT = 999;
const SHIPPING_CHARGE = 79;

const roundAmount = (amount) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

const calculateShipping = (subtotalAfterDiscount) => {
  return subtotalAfterDiscount >= FREE_SHIPPING_LIMIT
    ? 0
    : SHIPPING_CHARGE;
};

const getVariant = (product, variantId) => {
  if (!variantId) return null;

  return product.variants?.find(
    (variant) =>
      variant._id.toString() === variantId.toString() &&
      variant.isActive !== false
  );
};

const calculateCouponDiscount = async (
  couponCode,
  userId,
  subtotal
) => {
  if (!couponCode) {
    return {
      coupon: null,
      couponDiscount: 0,
      couponCode: "",
    };
  }

  const code = couponCode.trim().toUpperCase();

  const coupon = await Coupon.findOne({
    code,
    isActive: true,
  });

  if (!coupon) {
    throw new Error("Invalid or inactive coupon.");
  }

  const now = new Date();

  if (
    now < new Date(coupon.startDate) ||
    now > new Date(coupon.endDate)
  ) {
    throw new Error("This coupon is not currently active.");
  }

  if (subtotal < coupon.minOrderValue) {
    throw new Error(
      `Minimum order value for this coupon is ₹${coupon.minOrderValue}.`
    );
  }

  if (
    coupon.usageLimit > 0 &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    throw new Error("This coupon usage limit has been reached.");
  }

  const userUsageCount = await CouponUsage.countDocuments({
    coupon: coupon._id,
    user: userId,
  });

  if (userUsageCount >= coupon.perUserLimit) {
    throw new Error(
      "You have already used this coupon the maximum allowed times."
    );
  }

  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount =
      (subtotal * coupon.discountValue) / 100;

    if (
      coupon.maxDiscount > 0 &&
      discount > coupon.maxDiscount
    ) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, subtotal);

  return {
    coupon,
    couponDiscount: roundAmount(discount),
    couponCode: coupon.code,
  };
};

// ==============================
// PREPARE CHECKOUT
// ==============================
const prepareCheckout = async (req, res) => {
  try {
    const { addressId, couponCode } = req.body;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address.",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const orderItems = [];

    let subtotal = 0;
    let productDiscount = 0;

    for (const item of cart.items) {
      const product = await Product.findOne({
        _id: item.product,
        isActive: true,
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            "One or more products in your cart are no longer available.",
        });
      }

      const variant = getVariant(
        product,
        item.variantId
      );

      if (item.variantId && !variant) {
        return res.status(400).json({
          success: false,
          message: `${product.name} variant is no longer available.`,
        });
      }

      const availableStock = variant
        ? variant.stock
        : product.stock;

      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have enough stock.`,
        });
      }

      const basePrice =
        variant?.price ?? product.price;

      const salePrice =
        variant?.discountPrice > 0
          ? variant.discountPrice
          : product.discountPrice > 0
          ? product.discountPrice
          : basePrice;

      const itemTotal =
        salePrice * item.quantity;

      subtotal += itemTotal;

      productDiscount += Math.max(
        0,
        (basePrice - salePrice) * item.quantity
      );

      orderItems.push({
        product: product._id,
        variantId: variant?._id || null,
        productName: product.name,
        productImage:
          variant?.images?.[0]?.url ||
          product.image ||
          product.images?.find(
            (image) => image.isPrimary
          )?.url ||
          "",
        variantName: variant?.name || "",
        sku: variant?.sku || product.sku || "",
        quantity: item.quantity,
        price: basePrice,
        discountPrice:
          salePrice < basePrice
            ? salePrice
            : 0,
        finalPrice: salePrice,
        total: itemTotal,
      });
    }

    subtotal = roundAmount(subtotal);
    productDiscount = roundAmount(productDiscount);

    const couponResult =
      await calculateCouponDiscount(
        couponCode,
        req.user._id,
        subtotal
      );

    const afterCoupon = Math.max(
      0,
      subtotal - couponResult.couponDiscount
    );

    const shippingCharge =
      calculateShipping(afterCoupon);

    const tax = 0;

    const totalAmount = roundAmount(
      afterCoupon +
        shippingCharge +
        tax
    );

    res.status(200).json({
      success: true,

      checkout: {
        orderItems,
        address,
        subtotal,
        productDiscount,
        couponCode: couponResult.couponCode,
        couponDiscount:
          couponResult.couponDiscount,
        shippingCharge,
        tax,
        totalAmount,
      },
    });
  } catch (error) {
    console.error(
      "Prepare checkout error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to prepare checkout.",
    });
  }
};

// ==============================
// CREATE RAZORPAY ORDER
// ==============================
const createRazorpayOrder = async (
  req,
  res
) => {
  try {
    const {
      addressId,
      couponCode,
    } = req.body;

    const checkoutResponse = await buildCheckoutData(
      req.user._id,
      addressId,
      couponCode
    );

    const {
      address,
      orderItems,
      subtotal,
      productDiscount,
      couponCode: finalCouponCode,
      couponDiscount,
      shippingCharge,
      tax,
      totalAmount,
    } = checkoutResponse;

    const razorpayOrder =
      await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `BHB-${Date.now()}`,
      });

    res.status(201).json({
      success: true,

      razorpayKey:
        process.env.RAZORPAY_KEY_ID,

      razorpayOrder,

      checkout: {
        address,
        orderItems,
        subtotal,
        productDiscount,
        couponCode: finalCouponCode,
        couponDiscount,
        shippingCharge,
        tax,
        totalAmount,
      },
    });
  } catch (error) {
    console.error(
      "Create Razorpay order error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to create payment order.",
    });
  }
};

// ==============================
// COD ORDER
// ==============================
const createCODOrder = async (
  req,
  res
) => {
  try {
    const {
      addressId,
      couponCode,
    } = req.body;

    const checkoutData = await buildCheckoutData(
      req.user._id,
      addressId,
      couponCode
    );

    const order = await createOrderFromCheckout(
      req.user._id,
      checkoutData,
      {
        paymentMethod: "COD",
        paymentStatus: "PENDING",
      }
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "COD order error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to place COD order.",
    });
  }
};

// ==============================
// BUILD CHECKOUT DATA
// ==============================
const buildCheckoutData = async (
  userId,
  addressId,
  couponCode
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      addressId
    )
  ) {
    throw new Error("Invalid address.");
  }

  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new Error("Address not found.");
  }

  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const orderItems = [];

  let subtotal = 0;
  let productDiscount = 0;

  for (const item of cart.items) {
    const product = await Product.findOne({
      _id: item.product,
      isActive: true,
    });

    if (!product) {
      throw new Error(
        "A product in your cart is unavailable."
      );
    }

    const variant = getVariant(
      product,
      item.variantId
    );

    if (item.variantId && !variant) {
      throw new Error(
        `${product.name} variant is unavailable.`
      );
    }

    const stock = variant
      ? variant.stock
      : product.stock;

    if (stock < item.quantity) {
      throw new Error(
        `${product.name} does not have enough stock.`
      );
    }

    const basePrice =
      variant?.price ?? product.price;

    const salePrice =
      variant?.discountPrice > 0
        ? variant.discountPrice
        : product.discountPrice > 0
        ? product.discountPrice
        : basePrice;

    const itemTotal =
      salePrice * item.quantity;

    subtotal += itemTotal;

    productDiscount += Math.max(
      0,
      (basePrice - salePrice) *
        item.quantity
    );

    orderItems.push({
      product: product._id,
      variantId: variant?._id || null,
      productName: product.name,
      productImage:
        variant?.images?.[0]?.url ||
        product.image ||
        product.images?.find(
          (image) => image.isPrimary
        )?.url ||
        "",
      variantName: variant?.name || "",
      sku: variant?.sku || product.sku || "",
      quantity: item.quantity,
      price: basePrice,
      discountPrice:
        salePrice < basePrice
          ? salePrice
          : 0,
      finalPrice: salePrice,
      total: itemTotal,
    });
  }

  subtotal = roundAmount(subtotal);
  productDiscount =
    roundAmount(productDiscount);

  const couponResult =
    await calculateCouponDiscount(
      couponCode,
      userId,
      subtotal
    );

  const afterCoupon = Math.max(
    0,
    subtotal - couponResult.couponDiscount
  );

  const shippingCharge =
    calculateShipping(afterCoupon);

  const tax = 0;

  const totalAmount = roundAmount(
    afterCoupon +
      shippingCharge +
      tax
  );

  return {
    address,
    orderItems,
    subtotal,
    productDiscount,
    couponCode:
      couponResult.couponCode,
    couponDiscount:
      couponResult.couponDiscount,
    shippingCharge,
    tax,
    totalAmount,
    coupon: couponResult.coupon,
  };
};

// ==============================
// CREATE ORDER + REDUCE STOCK
// ==============================
const createOrderFromCheckout = async (
  userId,
  checkoutData,
  paymentData
) => {
  const session =
    await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(
      async () => {
        const {
          address,
          orderItems,
          subtotal,
          productDiscount,
          couponCode,
          couponDiscount,
          shippingCharge,
          tax,
          totalAmount,
          coupon,
        } = checkoutData;

        for (const item of orderItems) {
          const product =
            await Product.findById(
              item.product
            ).session(session);

          if (!product) {
            throw new Error(
              `${item.productName} is unavailable.`
            );
          }

          if (item.variantId) {
            const variant =
              product.variants.id(
                item.variantId
              );

            if (!variant) {
              throw new Error(
                `${item.productName} variant is unavailable.`
              );
            }

            if (
              variant.stock <
              item.quantity
            ) {
              throw new Error(
                `${item.productName} is out of stock.`
              );
            }

            variant.stock -= item.quantity;
          } else {
            if (
              product.stock <
              item.quantity
            ) {
              throw new Error(
                `${item.productName} is out of stock.`
              );
            }

            product.stock -= item.quantity;
          }

          await product.save({
            session,
          });
        }

        const order =
          new Order({
            user: userId,

            orderItems,

            shippingAddress: {
              fullName: address.fullName,
              phone: address.phone,
              house: address.house,
              street: address.street,
              landmark:
                address.landmark,
              city: address.city,
              state: address.state,
              pinCode: address.pinCode,
              addressType:
                address.addressType,
            },

            subtotal,
            productDiscount,
            couponCode,
            couponDiscount,
            shippingCharge,
            tax,
            totalAmount,

            paymentMethod:
              paymentData.paymentMethod,

            paymentStatus:
              paymentData.paymentStatus,

            orderStatus: "PLACED",

            razorpayOrderId:
              paymentData.razorpayOrderId ||
              "",

            razorpayPaymentId:
              paymentData.razorpayPaymentId ||
              "",

            razorpaySignature:
              paymentData.razorpaySignature ||
              "",
          });

        createdOrder =
          await order.save({
            session,
          });

        if (coupon) {
          coupon.usedCount += 1;

          await coupon.save({
            session,
          });

          await CouponUsage.create(
            [
              {
                coupon: coupon._id,
                user: userId,
                order: createdOrder._id,
              },
            ],
            { session }
          );
        }

        await Cart.findOneAndUpdate(
          { user: userId },
          { $set: { items: [] } },
          { session }
        );
      }
    );

    // =====================================================
    // ORDER PLACED NOTIFICATION + EMAIL
    // =====================================================
    //
    // These are intentionally executed AFTER the database
    // transaction succeeds.
    //
    // If notification/email fails, the order should NOT fail
    // because the order has already been successfully created.
    // =====================================================

    try {
      await Notification.create({
        user: userId,
        type: "ORDER_PLACED",
        title: "Order Placed Successfully",
        message: `Your order has been placed successfully. Your order total is ₹${createdOrder.totalAmount}.`,
        icon: "🛍️",
        link: `/orders/${createdOrder._id}`,
        order: createdOrder._id,
        isRead: false,
      });

      console.log(
        `Order notification created for user ${userId}`
      );
    } catch (notificationError) {
      console.error(
        "Order notification failed:",
        notificationError.message
      );
    }

    try {
      const user = await User.findById(userId).select(
        "name username email"
      );

      if (user?.email) {
        await sendOrderConfirmationEmail(
          user,
          createdOrder
        );

        console.log(
          `Order confirmation email processed for ${user.email}`
        );
      } else {
        console.warn(
          `Order confirmation email skipped: no email found for user ${userId}`
        );
      }
    } catch (emailError) {
      console.error(
        "Order confirmation email failed:",
        emailError.message
      );
    }

    return createdOrder;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  prepareCheckout,
  createRazorpayOrder,
  createCODOrder,
  buildCheckoutData,
  createOrderFromCheckout,
};