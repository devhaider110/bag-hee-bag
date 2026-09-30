const mongoose = require("mongoose");
const Order = require("../models/Order");

/* ----------------------------------
   GET MY ORDERS
---------------------------------- */

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch your orders.",
    });
  }
};

/* ----------------------------------
   GET MY ORDER BY ID
---------------------------------- */

const getMyOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get my order error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch order details.",
    });
  }
};

/* ----------------------------------
   GET ALL ORDERS - ADMIN
---------------------------------- */

const getAllOrders = async (req, res) => {
  try {
    const {
      search = "",
      orderStatus = "",
      paymentStatus = "",
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.max(Number(limit) || 10, 1);

    const filter = {};

    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      const matchingOrders = await Order.find({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(search) ? search : null },
          { "shippingAddress.fullName": searchRegex },
          { "shippingAddress.phone": searchRegex },
          { "shippingAddress.city": searchRegex },
          { "shipping.trackingNumber": searchRegex },
          { "shipping.carrier": searchRegex },
        ],
      }).select("_id");

      const matchingIds = matchingOrders.map((order) => order._id);

      filter.$or = [
        ...(matchingIds.length > 0
          ? [{ _id: { $in: matchingIds } }]
          : []),
        { "shippingAddress.fullName": searchRegex },
        { "shippingAddress.phone": searchRegex },
        { "shippingAddress.city": searchRegex },
        { "shipping.trackingNumber": searchRegex },
        { "shipping.carrier": searchRegex },
      ];
    }

    const totalOrders = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("user", "name username email phone")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        page: currentPage,
        limit: perPage,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / perPage),
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch orders.",
    });
  }
};

/* ----------------------------------
   GET ADMIN ORDER BY ID
---------------------------------- */

const getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findById(id).populate(
      "user",
      "name username email phone"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get admin order error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch order details.",
    });
  }
};

/* ----------------------------------
   UPDATE ORDER STATUS - ADMIN
---------------------------------- */

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const allowedStatuses = [
      "PENDING",
      "PLACED",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURN_REQUESTED",
      "RETURNED",
      "REFUNDED",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    order.orderStatus = orderStatus;

    /* Sync shipping status */

    if (orderStatus === "SHIPPED") {
      order.shipping.shippingStatus = "SHIPPED";

      if (!order.shipping.shippedAt) {
        order.shipping.shippedAt = new Date();
      }
    }

    if (orderStatus === "OUT_FOR_DELIVERY") {
      order.shipping.shippingStatus = "OUT_FOR_DELIVERY";

      if (!order.shipping.outForDeliveryAt) {
        order.shipping.outForDeliveryAt = new Date();
      }
    }

    if (orderStatus === "DELIVERED") {
      order.shipping.shippingStatus = "DELIVERED";

      if (!order.shipping.deliveredAt) {
        order.shipping.deliveredAt = new Date();
      }
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id).populate(
      "user",
      "name username email phone"
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update order status.",
    });
  }
};

/* ----------------------------------
   UPDATE PAYMENT STATUS - ADMIN
---------------------------------- */

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const allowedStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
    ];

    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status.",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    order.paymentStatus = paymentStatus;

    await order.save();

    const updatedOrder = await Order.findById(order._id).populate(
      "user",
      "name username email phone"
    );

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update payment status error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update payment status.",
    });
  }
};

/* ----------------------------------
   UPDATE SHIPPING DETAILS - ADMIN
---------------------------------- */

const updateShippingDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      shippingStatus,
      carrier,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const allowedShippingStatuses = [
      "NOT_SHIPPED",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    if (
      shippingStatus &&
      !allowedShippingStatuses.includes(shippingStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipping status.",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    /* Shipping status */

    if (shippingStatus) {
      order.shipping.shippingStatus = shippingStatus;
    }

    /* Carrier */

    if (carrier !== undefined) {
      order.shipping.carrier = String(carrier).trim();
    }

    /* Tracking number */

    if (trackingNumber !== undefined) {
      order.shipping.trackingNumber =
        String(trackingNumber).trim();
    }

    /* Tracking URL */

    if (trackingUrl !== undefined) {
      order.shipping.trackingUrl =
        String(trackingUrl).trim();
    }

    /* Estimated delivery */

    if (estimatedDelivery !== undefined && estimatedDelivery !== "") {
      const parsedDate = new Date(estimatedDelivery);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid estimated delivery date.",
        });
      }

      order.shipping.estimatedDelivery = parsedDate;
    }

    /* ----------------------------------
       AUTOMATIC TIMESTAMPS
    ---------------------------------- */

    const now = new Date();

    if (shippingStatus === "PACKED") {
      if (!order.shipping.packedAt) {
        order.shipping.packedAt = now;
      }

      if (
        order.orderStatus === "PENDING" ||
        order.orderStatus === "PLACED" ||
        order.orderStatus === "CONFIRMED"
      ) {
        order.orderStatus = "PROCESSING";
      }
    }

    if (shippingStatus === "SHIPPED") {
      if (!order.shipping.shippedAt) {
        order.shipping.shippedAt = now;
      }

      order.orderStatus = "SHIPPED";
    }

    if (shippingStatus === "OUT_FOR_DELIVERY") {
      if (!order.shipping.outForDeliveryAt) {
        order.shipping.outForDeliveryAt = now;
      }

      order.orderStatus = "OUT_FOR_DELIVERY";
    }

    if (shippingStatus === "DELIVERED") {
      if (!order.shipping.deliveredAt) {
        order.shipping.deliveredAt = now;
      }

      order.orderStatus = "DELIVERED";
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id).populate(
      "user",
      "name username email phone"
    );

    res.status(200).json({
      success: true,
      message: "Shipping details updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update shipping details error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update shipping details.",
    });
  }
};

/* ----------------------------------
   EXPORTS
---------------------------------- */

module.exports = {
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  updateShippingDetails,
};