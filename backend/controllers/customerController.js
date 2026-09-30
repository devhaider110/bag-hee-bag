// const mongoose = require("mongoose");

// const Cart = require("../models/Cart");
// const Address = require("../models/Address");
// const Product = require("../models/Product");
// const Coupon = require("../models/Coupon");
// const CouponUsage = require("../models/CouponUsage");
// const Order = require("../models/Order");
// const User = require("../models/User");
// const Notification = require("../models/Notification");
// const Inventory = require("../models/Inventory");

// const razorpay = require("../config/razorpay");
// const {
//   sendOrderConfirmationEmail,
// } = require("../config/mailer");

// const FREE_SHIPPING_LIMIT = 999;
// const SHIPPING_CHARGE = 79;

// const roundAmount = (amount) =>
//   Math.round(
//     (amount + Number.EPSILON) * 100
//   ) / 100;

// const calculateShipping = (
//   subtotalAfterDiscount
// ) => {
//   return subtotalAfterDiscount >=
//     FREE_SHIPPING_LIMIT
//     ? 0
//     : SHIPPING_CHARGE;
// };

// const getVariant = (
//   product,
//   variantId
// ) => {
//   if (!variantId) return null;

//   return product.variants?.find(
//     (variant) =>
//       variant._id.toString() ===
//         variantId.toString() &&
//       variant.isActive !== false
//   );
// };

// const calculateCouponDiscount =
//   async (
//     couponCode,
//     userId,
//     subtotal
//   ) => {
//     if (!couponCode) {
//       return {
//         coupon: null,
//         couponDiscount: 0,
//         couponCode: "",
//       };
//     }

//     const code =
//       couponCode.trim().toUpperCase();

//     const coupon =
//       await Coupon.findOne({
//         code,
//         isActive: true,
//       });

//     if (!coupon) {
//       throw new Error(
//         "Invalid or inactive coupon."
//       );
//     }

//     const now = new Date();

//     if (
//       now <
//         new Date(
//           coupon.startDate
//         ) ||
//       now >
//         new Date(
//           coupon.endDate
//         )
//     ) {
//       throw new Error(
//         "This coupon is not currently active."
//       );
//     }

//     if (
//       subtotal <
//       coupon.minOrderValue
//     ) {
//       throw new Error(
//         `Minimum order value for this coupon is ₹${coupon.minOrderValue}.`
//       );
//     }

//     if (
//       coupon.usageLimit > 0 &&
//       coupon.usedCount >=
//         coupon.usageLimit
//     ) {
//       throw new Error(
//         "This coupon usage limit has been reached."
//       );
//     }

//     const userUsageCount =
//       await CouponUsage.countDocuments({
//         coupon: coupon._id,
//         user: userId,
//       });

//     if (
//       userUsageCount >=
//       coupon.perUserLimit
//     ) {
//       throw new Error(
//         "You have already used this coupon the maximum allowed times."
//       );
//     }

//     let discount = 0;

//     if (
//       coupon.discountType ===
//       "percentage"
//     ) {
//       discount =
//         (subtotal *
//           coupon.discountValue) /
//         100;

//       if (
//         coupon.maxDiscount > 0 &&
//         discount >
//           coupon.maxDiscount
//       ) {
//         discount =
//           coupon.maxDiscount;
//       }
//     } else {
//       discount =
//         coupon.discountValue;
//     }

//     discount = Math.min(
//       discount,
//       subtotal
//     );

//     return {
//       coupon,
//       couponDiscount:
//         roundAmount(discount),
//       couponCode:
//         coupon.code,
//     };
//   };

// // ==============================
// // PREPARE CHECKOUT
// // ==============================
// const prepareCheckout = async (
//   req,
//   res
// ) => {
//   try {
//     const {
//       addressId,
//       couponCode,
//     } = req.body;

//     if (
//       !mongoose.Types.ObjectId.isValid(
//         addressId
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid address.",
//       });
//     }

//     const address =
//       await Address.findOne({
//         _id: addressId,
//         user: req.user._id,
//       });

//     if (!address) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Address not found.",
//       });
//     }

//     const cart =
//       await Cart.findOne({
//         user: req.user._id,
//       });

//     if (
//       !cart ||
//       cart.items.length === 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Your cart is empty.",
//       });
//     }

//     const orderItems = [];

//     let subtotal = 0;
//     let productDiscount = 0;

//     for (const item of cart.items) {
//       const product =
//         await Product.findOne({
//           _id: item.product,
//           isActive: true,
//         });

//       if (!product) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "One or more products in your cart are no longer available.",
//         });
//       }

//       const variant =
//         getVariant(
//           product,
//           item.variantId
//         );

//       if (
//         item.variantId &&
//         !variant
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: `${product.name} variant is no longer available.`,
//         });
//       }

//       const availableStock =
//         variant
//           ? variant.stock
//           : product.stock;

//       if (
//         availableStock <
//         item.quantity
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: `${product.name} does not have enough stock.`,
//         });
//       }

//       const basePrice =
//         variant?.price ??
//         product.price;

//       const salePrice =
//         variant?.discountPrice >
//         0
//           ? variant.discountPrice
//           : product.discountPrice >
//             0
//           ? product.discountPrice
//           : basePrice;

//       const itemTotal =
//         salePrice *
//         item.quantity;

//       subtotal += itemTotal;

//       productDiscount +=
//         Math.max(
//           0,
//           (basePrice -
//             salePrice) *
//             item.quantity
//         );

//       orderItems.push({
//         product:
//           product._id,

//         variantId:
//           variant?._id || null,

//         productName:
//           product.name,

//         productImage:
//           variant?.images?.[0]
//             ?.url ||
//           product.image ||
//           product.images?.find(
//             (image) =>
//               image.isPrimary
//           )?.url ||
//           "",

//         variantName:
//           variant?.name || "",

//         sku:
//           variant?.sku ||
//           product.sku ||
//           "",

//         quantity:
//           item.quantity,

//         price:
//           basePrice,

//         discountPrice:
//           salePrice <
//           basePrice
//             ? salePrice
//             : 0,

//         finalPrice:
//           salePrice,

//         total:
//           itemTotal,
//       });
//     }

//     subtotal =
//       roundAmount(subtotal);

//     productDiscount =
//       roundAmount(
//         productDiscount
//       );

//     const couponResult =
//       await calculateCouponDiscount(
//         couponCode,
//         req.user._id,
//         subtotal
//       );

//     const afterCoupon =
//       Math.max(
//         0,
//         subtotal -
//           couponResult.couponDiscount
//       );

//     const shippingCharge =
//       calculateShipping(
//         afterCoupon
//       );

//     const tax = 0;

//     const totalAmount =
//       roundAmount(
//         afterCoupon +
//           shippingCharge +
//           tax
//       );

//     res.status(200).json({
//       success: true,

//       checkout: {
//         orderItems,
//         address,
//         subtotal,
//         productDiscount,
//         couponCode:
//           couponResult.couponCode,
//         couponDiscount:
//           couponResult.couponDiscount,
//         shippingCharge,
//         tax,
//         totalAmount,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Prepare checkout error:",
//       error
//     );

//     res.status(400).json({
//       success: false,
//       message:
//         error.message ||
//         "Failed to prepare checkout.",
//     });
//   }
// };

// // ==============================
// // CREATE RAZORPAY ORDER
// // ==============================
// const createRazorpayOrder =
//   async (req, res) => {
//     try {
//       const {
//         addressId,
//         couponCode,
//       } = req.body;

//       const checkoutResponse =
//         await buildCheckoutData(
//           req.user._id,
//           addressId,
//           couponCode
//         );

//       const {
//         address,
//         orderItems,
//         subtotal,
//         productDiscount,
//         couponCode:
//           finalCouponCode,
//         couponDiscount,
//         shippingCharge,
//         tax,
//         totalAmount,
//       } = checkoutResponse;

//       const razorpayOrder =
//         await razorpay.orders.create(
//           {
//             amount:
//               Math.round(
//                 totalAmount * 100
//               ),

//             currency: "INR",

//             receipt: `BHB-${Date.now()}`,
//           }
//         );

//       res.status(201).json({
//         success: true,

//         razorpayKey:
//           process.env
//             .RAZORPAY_KEY_ID,

//         razorpayOrder,

//         checkout: {
//           address,
//           orderItems,
//           subtotal,
//           productDiscount,
//           couponCode:
//             finalCouponCode,
//           couponDiscount,
//           shippingCharge,
//           tax,
//           totalAmount,
//         },
//       });
//     } catch (error) {
//       console.error(
//         "Create Razorpay order error:",
//         error
//       );

//       res.status(400).json({
//         success: false,
//         message:
//           error.message ||
//           "Unable to create payment order.",
//       });
//     }
//   };

// // ==============================
// // COD ORDER
// // ==============================
// const createCODOrder =
//   async (req, res) => {
//     try {
//       const {
//         addressId,
//         couponCode,
//       } = req.body;

//       const checkoutData =
//         await buildCheckoutData(
//           req.user._id,
//           addressId,
//           couponCode
//         );

//       const order =
//         await createOrderFromCheckout(
//           req.user._id,
//           checkoutData,
//           {
//             paymentMethod:
//               "COD",

//             paymentStatus:
//               "PENDING",
//           }
//         );

//       res.status(201).json({
//         success: true,

//         message:
//           "Order placed successfully.",

//         order: {
//           _id: order._id,

//           totalAmount:
//             order.totalAmount,

//           paymentMethod:
//             order.paymentMethod,

//           paymentStatus:
//             order.paymentStatus,

//           orderStatus:
//             order.orderStatus,

//           createdAt:
//             order.createdAt,
//         },
//       });
//     } catch (error) {
//       console.error(
//         "COD order error:",
//         error
//       );

//       res.status(400).json({
//         success: false,
//         message:
//           error.message ||
//           "Failed to place COD order.",
//       });
//     }
//   };

// // ==============================
// // BUILD CHECKOUT DATA
// // ==============================
// const buildCheckoutData =
//   async (
//     userId,
//     addressId,
//     couponCode
//   ) => {
//     if (
//       !mongoose.Types.ObjectId.isValid(
//         addressId
//       )
//     ) {
//       throw new Error(
//         "Invalid address."
//       );
//     }

//     const address =
//       await Address.findOne({
//         _id: addressId,
//         user: userId,
//       });

//     if (!address) {
//       throw new Error(
//         "Address not found."
//       );
//     }

//     const cart =
//       await Cart.findOne({
//         user: userId,
//       });

//     if (
//       !cart ||
//       cart.items.length === 0
//     ) {
//       throw new Error(
//         "Your cart is empty."
//       );
//     }

//     const orderItems = [];

//     let subtotal = 0;
//     let productDiscount = 0;

//     for (const item of cart.items) {
//       const product =
//         await Product.findOne({
//           _id: item.product,
//           isActive: true,
//         });

//       if (!product) {
//         throw new Error(
//           "A product in your cart is unavailable."
//         );
//       }

//       const variant =
//         getVariant(
//           product,
//           item.variantId
//         );

//       if (
//         item.variantId &&
//         !variant
//       ) {
//         throw new Error(
//           `${product.name} variant is unavailable.`
//         );
//       }

//       const stock =
//         variant
//           ? variant.stock
//           : product.stock;

//       if (
//         stock < item.quantity
//       ) {
//         throw new Error(
//           `${product.name} does not have enough stock.`
//         );
//       }

//       const basePrice =
//         variant?.price ??
//         product.price;

//       const salePrice =
//         variant?.discountPrice >
//         0
//           ? variant.discountPrice
//           : product.discountPrice >
//             0
//           ? product.discountPrice
//           : basePrice;

//       const itemTotal =
//         salePrice *
//         item.quantity;

//       subtotal += itemTotal;

//       productDiscount +=
//         Math.max(
//           0,
//           (basePrice -
//             salePrice) *
//             item.quantity
//         );

//       orderItems.push({
//         product:
//           product._id,

//         variantId:
//           variant?._id || null,

//         productName:
//           product.name,

//         productImage:
//           variant?.images?.[0]
//             ?.url ||
//           product.image ||
//           product.images?.find(
//             (image) =>
//               image.isPrimary
//           )?.url ||
//           "",

//         variantName:
//           variant?.name || "",

//         sku:
//           variant?.sku ||
//           product.sku ||
//           "",

//         quantity:
//           item.quantity,

//         price:
//           basePrice,

//         discountPrice:
//           salePrice <
//           basePrice
//             ? salePrice
//             : 0,

//         finalPrice:
//           salePrice,

//         total:
//           itemTotal,
//       });
//     }

//     subtotal =
//       roundAmount(subtotal);

//     productDiscount =
//       roundAmount(
//         productDiscount
//       );

//     const couponResult =
//       await calculateCouponDiscount(
//         couponCode,
//         userId,
//         subtotal
//       );

//     const afterCoupon =
//       Math.max(
//         0,
//         subtotal -
//           couponResult.couponDiscount
//       );

//     const shippingCharge =
//       calculateShipping(
//         afterCoupon
//       );

//     const tax = 0;

//     const totalAmount =
//       roundAmount(
//         afterCoupon +
//           shippingCharge +
//           tax
//       );

//     return {
//       address,

//       orderItems,

//       subtotal,

//       productDiscount,

//       couponCode:
//         couponResult.couponCode,

//       couponDiscount:
//         couponResult.couponDiscount,

//       shippingCharge,

//       tax,

//       totalAmount,

//       coupon:
//         couponResult.coupon,
//     };
//   };

// // ==============================
// // CREATE ORDER + REDUCE STOCK
// // ==============================
// const createOrderFromCheckout =
//   async (
//     userId,
//     checkoutData,
//     paymentData
//   ) => {
//     const session =
//       await mongoose.startSession();

//     try {
//       let createdOrder;

//       await session.withTransaction(
//         async () => {
//           const {
//             address,
//             orderItems,
//             subtotal,
//             productDiscount,
//             couponCode,
//             couponDiscount,
//             shippingCharge,
//             tax,
//             totalAmount,
//             coupon,
//           } = checkoutData;

//           /* ===============================================
//              REDUCE STOCK + RECORD INVENTORY
//           =============================================== */

//           for (const item of orderItems) {
//             const product =
//               await Product.findById(
//                 item.product
//               ).session(session);

//             if (!product) {
//               throw new Error(
//                 `${item.productName} is unavailable.`
//               );
//             }

//             /* =============================================
//                VARIANT STOCK
//             ============================================= */

//             if (item.variantId) {
//               const variant =
//                 product.variants.id(
//                   item.variantId
//                 );

//               if (!variant) {
//                 throw new Error(
//                   `${item.productName} variant is unavailable.`
//                 );
//               }

//               if (
//                 variant.stock <
//                 item.quantity
//               ) {
//                 throw new Error(
//                   `${item.productName} is out of stock.`
//                 );
//               }

//               const previousStock =
//                 variant.stock;

//               variant.stock -=
//                 item.quantity;

//               const newStock =
//                 variant.stock;

//               /* =========================================
//                  SAVE PRODUCT
//               ========================================= */

//               await product.save({
//                 session,
//               });

//               /* =========================================
//                  INVENTORY MOVEMENT

//                  SALE = stock reduction
//               ========================================= */

//               await Inventory.create(
//                 [
//                   {
//                     product:
//                       product._id,

//                     variantId:
//                       variant._id,

//                     type:
//                       "SALE",

//                     quantity:
//                       item.quantity,

//                     previousStock,

//                     newStock,

//                     reason:
//                       "Stock deducted after order placement.",

//                     order: null,

//                     performedBy:
//                       null,
//                   },
//                 ],
//                 {
//                   session,
//                 }
//               );
//             }

//             /* =============================================
//                MAIN PRODUCT STOCK
//             ============================================= */

//             else {
//               if (
//                 product.stock <
//                 item.quantity
//               ) {
//                 throw new Error(
//                   `${item.productName} is out of stock.`
//                 );
//               }

//               const previousStock =
//                 product.stock;

//               product.stock -=
//                 item.quantity;

//               const newStock =
//                 product.stock;

//               /* =========================================
//                  SAVE PRODUCT
//               ========================================= */

//               await product.save({
//                 session,
//               });

//               /* =========================================
//                  INVENTORY MOVEMENT

//                  SALE = stock reduction
//               ========================================= */

//               await Inventory.create(
//                 [
//                   {
//                     product:
//                       product._id,

//                     variantId: null,

//                     type:
//                       "SALE",

//                     quantity:
//                       item.quantity,

//                     previousStock,

//                     newStock,

//                     reason:
//                       "Stock deducted after order placement.",

//                     order: null,

//                     performedBy:
//                       null,
//                   },
//                 ],
//                 {
//                   session,
//                 }
//               );
//             }
//           }

//           /* ===============================================
//              CREATE ORDER
//           =============================================== */

//           const order =
//             new Order({
//               user: userId,

//               orderItems,

//               shippingAddress: {
//                 fullName:
//                   address.fullName,

//                 phone:
//                   address.phone,

//                 house:
//                   address.house,

//                 street:
//                   address.street,

//                 landmark:
//                   address.landmark,

//                 city:
//                   address.city,

//                 state:
//                   address.state,

//                 pinCode:
//                   address.pinCode,

//                 addressType:
//                   address.addressType,
//               },

//               subtotal,

//               productDiscount,

//               couponCode,

//               couponDiscount,

//               shippingCharge,

//               tax,

//               totalAmount,

//               paymentMethod:
//                 paymentData.paymentMethod,

//               paymentStatus:
//                 paymentData.paymentStatus,

//               orderStatus:
//                 "PLACED",

//               razorpayOrderId:
//                 paymentData.razorpayOrderId ||
//                 "",

//               razorpayPaymentId:
//                 paymentData.razorpayPaymentId ||
//                 "",

//               razorpaySignature:
//                 paymentData.razorpaySignature ||
//                 "",
//             });

//           createdOrder =
//             await order.save({
//               session,
//             });

//           /* ===============================================
//              LINK INVENTORY MOVEMENTS TO ORDER

//              Inventory records were created before Order
//              because the stock movement and order must be
//              part of the same transaction.

//              Now attach the newly created order ID.
//           =============================================== */

//           await Inventory.updateMany(
//             {
//               order: null,

//               type: "SALE",

//               product: {
//                 $in:
//                   orderItems.map(
//                     (item) =>
//                       item.product
//                   ),
//               },

//               createdAt: {
//                 $gte:
//                   new Date(
//                     Date.now() -
//                       60 * 1000
//                   ),
//               },
//             },
//             {
//               $set: {
//                 order:
//                   createdOrder._id,
//               },
//             },
//             {
//               session,
//             }
//           );

//           /* ===============================================
//              COUPON
//           =============================================== */

//           if (coupon) {
//             coupon.usedCount +=
//               1;

//             await coupon.save({
//               session,
//             });

//             await CouponUsage.create(
//               [
//                 {
//                   coupon:
//                     coupon._id,

//                   user: userId,

//                   order:
//                     createdOrder._id,
//                 },
//               ],
//               {
//                 session,
//               }
//             );
//           }

//           /* ===============================================
//              CLEAR CART
//           =============================================== */

//           await Cart.findOneAndUpdate(
//             {
//               user: userId,
//             },

//             {
//               $set: {
//                 items: [],
//               },
//             },

//             {
//               session,
//             }
//           );
//         }
//       );

//       /* ===================================================
//          ORDER PLACED NOTIFICATION + EMAIL
//       =================================================== */

//       try {
//         await Notification.create({
//           user: userId,

//           type:
//             "ORDER_PLACED",

//           title:
//             "Order Placed Successfully",

//           message: `Your order has been placed successfully. Your order total is ₹${createdOrder.totalAmount}.`,

//           icon: "🛍️",

//           link: `/orders/${createdOrder._id}`,

//           order:
//             createdOrder._id,

//           isRead: false,
//         });

//         console.log(
//           `Order notification created for user ${userId}`
//         );
//       } catch (
//         notificationError
//       ) {
//         console.error(
//           "Order notification failed:",
//           notificationError.message
//         );
//       }

//       /* ===================================================
//          ORDER CONFIRMATION EMAIL
//       =================================================== */

//       try {
//         const user =
//           await User.findById(
//             userId
//           ).select(
//             "name username email"
//           );

//         if (user?.email) {
//           await sendOrderConfirmationEmail(
//             user,
//             createdOrder
//           );

//           console.log(
//             `Order confirmation email processed for ${user.email}`
//           );
//         } else {
//           console.warn(
//             `Order confirmation email skipped: no email found for user ${userId}`
//           );
//         }
//       } catch (emailError) {
//         console.error(
//           "Order confirmation email failed:",
//           emailError.message
//         );
//       }

//       return createdOrder;
//     } finally {
//       await session.endSession();
//     }
//   };

// module.exports = {
//   prepareCheckout,
//   createRazorpayOrder,
//   createCODOrder,
//   buildCheckoutData,
//   createOrderFromCheckout,
// };

const mongoose = require("mongoose");

const User = require("../models/User");
const Order = require("../models/Order");
const Wishlist = require("../models/Wishlist");
const RecentlyViewed = require("../models/RecentlyViewed");
const Address = require("../models/Address");

// ==========================================
// REMOVE SENSITIVE CUSTOMER DATA
// ==========================================
const sanitizeCustomer = (customer) => {
  if (!customer) {
    return null;
  }

  const sanitized = {
    ...customer,
  };

  delete sanitized.password;

  return sanitized;
};

// ==========================================
// BUILD CUSTOMER ORDER STATS
// ==========================================
const buildCustomerStats = async (userId) => {
  const stats = await Order.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: "$user",

        totalOrders: {
          $sum: 1,
        },

        totalSpent: {
          $sum: {
            $cond: [
              {
                $in: ["$orderStatus", ["CANCELLED"]],
              },
              0,
              "$totalAmount",
            ],
          },
        },

        lastOrderAt: {
          $max: "$createdAt",
        },
      },
    },
  ]);

  if (!stats.length) {
    return {
      totalOrders: 0,
      totalSpent: 0,
      lastOrderAt: null,
    };
  }

  return {
    totalOrders: stats[0].totalOrders || 0,
    totalSpent: Number((stats[0].totalSpent || 0).toFixed(2)),
    lastOrderAt: stats[0].lastOrderAt || null,
  };
};

// ==========================================
// ADMIN - GET ALL CUSTOMERS
// ==========================================
const getAllCustomers = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      verification = "all",
      role = "customer",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(limit) || 10));

    const query = {};

    // ========================================
    // ROLE FILTER
    // ========================================
    if (role && role !== "all") {
      query.role = role;
    }

    // ========================================
    // ACTIVE / INACTIVE FILTER
    // ========================================
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    // ========================================
    // VERIFIED / UNVERIFIED FILTER
    // ========================================
    if (verification === "verified") {
      query.isVerified = true;
    } else if (verification === "unverified") {
      query.isVerified = false;
    }

    // ========================================
    // SEARCH
    // ========================================
    const trimmedSearch = String(search).trim();

    if (trimmedSearch) {
      const searchRegex = new RegExp(
        trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const skip = (currentPage - 1) * perPage;

    const [customers, totalCustomers] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),

      User.countDocuments(query),
    ]);

    // ========================================
    // ADD ORDER STATISTICS
    // ========================================
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const stats = await buildCustomerStats(customer._id);

        return {
          ...sanitizeCustomer(customer),
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          lastOrderAt: stats.lastOrderAt,
        };
      })
    );

    const totalPages = Math.ceil(totalCustomers / perPage);

    return res.status(200).json({
      success: true,
      customers: customersWithStats,
      pagination: {
        page: currentPage,
        limit: perPage,
        total: totalCustomers,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get all customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers.",
    });
  }
};

// ==========================================
// ADMIN - GET CUSTOMER DETAILS
// ==========================================
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const customer = await User.findById(id).select("-password").lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const [stats, orders, wishlist, recentlyViewed, addresses] =
      await Promise.all([
        // ORDER STATS
        buildCustomerStats(id),

        // ORDER HISTORY
        Order.find({ user: id })
          .populate("orderItems.product", "name sku image price discountPrice")
          .sort({ createdAt: -1 })
          .lean(),

        // WISHLIST
        Wishlist.find({ user: id })
          .populate("products", "name sku image price discountPrice stock isActive")
          .lean(),

        // RECENTLY VIEWED
        RecentlyViewed.find({ user: id })
          .populate("products.product", "name sku image price discountPrice stock isActive")
          .lean(),

        // ADDRESSES
        Address.find({ user: id })
          .sort({ createdAt: -1 })
          .lean(),
      ]);

    return res.status(200).json({
      success: true,
      customer: {
        ...sanitizeCustomer(customer),
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderAt: stats.lastOrderAt,
        orders,
        wishlist,
        recentlyViewed,
        addresses,
      },
    });
  } catch (error) {
    console.error("Get customer details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer details.",
    });
  }
};

// ==========================================
// ADMIN - ACTIVATE / DEACTIVATE CUSTOMER
// ==========================================
const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value.",
      });
    }

    const customer = await User.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    if (customer.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customer accounts can be modified from Customer Management.",
      });
    }

    customer.isActive = isActive;
    await customer.save();

    const sanitizedCustomer = customer.toObject();
    delete sanitizedCustomer.password;

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Customer activated successfully."
        : "Customer deactivated successfully.",
      customer: sanitizedCustomer,
    });
  } catch (error) {
    console.error("Update customer status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer status.",
    });
  }
};

// ==========================================
// ADMIN - VERIFY / UNVERIFY CUSTOMER
// ==========================================
const updateCustomerVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVerified must be a boolean value.",
      });
    }

    const customer = await User.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    if (customer.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customer accounts can be modified from Customer Management.",
      });
    }

    customer.isVerified = isVerified;
    await customer.save();

    const sanitizedCustomer = customer.toObject();
    delete sanitizedCustomer.password;

    return res.status(200).json({
      success: true,
      message: isVerified
        ? "Customer verified successfully."
        : "Customer verification removed successfully.",
      customer: sanitizedCustomer,
    });
  } catch (error) {
    console.error("Update customer verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer verification.",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
  updateCustomerVerification,
};