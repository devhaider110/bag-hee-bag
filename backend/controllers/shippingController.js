const mongoose = require("mongoose");

const Shipment = require("../models/Shipment");
const Order = require("../models/Order");

const STATUS_CONFIG = {
  ORDER_PLACED: {
    title: "Order Placed",
    description: "Your order has been placed successfully.",
    orderStatus: "PENDING",
  },

  CONFIRMED: {
    title: "Order Confirmed",
    description: "Your order has been confirmed by BAG HEE BAG.",
    orderStatus: "CONFIRMED",
  },

  PROCESSING: {
    title: "Processing",
    description: "Your order is being prepared.",
    orderStatus: "PROCESSING",
  },

  PACKED: {
    title: "Packed",
    description: "Your order has been packed and is ready for dispatch.",
    orderStatus: "PROCESSING",
  },

  SHIPPED: {
    title: "Shipped",
    description: "Your order has been handed over for delivery.",
    orderStatus: "SHIPPED",
  },

  OUT_FOR_DELIVERY: {
    title: "Out for Delivery",
    description: "Your order is out for delivery.",
    orderStatus: "SHIPPED",
  },

  DELIVERED: {
    title: "Delivered",
    description: "Your order has been delivered successfully.",
    orderStatus: "DELIVERED",
  },
};

const VALID_STATUSES = Object.keys(STATUS_CONFIG);

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const buildInitialTimeline = (orderStatus) => {
  const timeline = [];

  const statusMap = {
    PENDING: "ORDER_PLACED",
    CONFIRMED: "CONFIRMED",
    PROCESSING: "PROCESSING",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
  };

  const current = statusMap[orderStatus] || "ORDER_PLACED";

  const order = [
    "ORDER_PLACED",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const currentIndex = order.indexOf(current);

  order.forEach((status, index) => {
    if (index <= currentIndex) {
      timeline.push({
        status,
        title: STATUS_CONFIG[status].title,
        description: STATUS_CONFIG[status].description,
        completedAt: index === 0 ? new Date() : null,
      });
    }
  });

  return timeline;
};

// ============================================================
// CUSTOMER - GET MY TRACKING
// ============================================================

exports.getMyTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    let shipment = await Shipment.findOne({
      order: orderId,
    }).lean();

    // Create shipment record automatically for older orders
    if (!shipment) {
      const initialTimeline = buildInitialTimeline(order.orderStatus);

      const createdShipment = await Shipment.create({
        order: orderId,
        currentStatus:
          initialTimeline.length > 0
            ? initialTimeline[initialTimeline.length - 1].status
            : "ORDER_PLACED",
        timeline: initialTimeline,
      });

      shipment = createdShipment.toObject();
    }

    return res.status(200).json({
      success: true,
      order,
      shipment,
    });
  } catch (error) {
    console.error("Get my tracking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load tracking information.",
    });
  }
};

// ============================================================
// ADMIN - GET SHIPPING DETAILS
// ============================================================

exports.getAdminShipping = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findById(orderId)
      .populate("user", "name email phone")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    let shipment = await Shipment.findOne({
      order: orderId,
    }).lean();

    if (!shipment) {
      const initialTimeline = buildInitialTimeline(order.orderStatus);

      const createdShipment = await Shipment.create({
        order: orderId,
        currentStatus:
          initialTimeline.length > 0
            ? initialTimeline[initialTimeline.length - 1].status
            : "ORDER_PLACED",
        timeline: initialTimeline,
      });

      shipment = createdShipment.toObject();
    }

    return res.status(200).json({
      success: true,
      order,
      shipment,
    });
  } catch (error) {
    console.error("Get admin shipping error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load shipping information.",
    });
  }
};

// ============================================================
// ADMIN - UPDATE SHIPPING INFORMATION
// ============================================================

exports.updateShippingInfo = async (req, res) => {
  try {
    const { orderId } = req.params;

    const {
      carrier,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      pickupAt,
    } = req.body;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    let shipment = await Shipment.findOne({
      order: orderId,
    });

    if (!shipment) {
      shipment = new Shipment({
        order: orderId,
        currentStatus: "ORDER_PLACED",
        timeline: buildInitialTimeline(order.orderStatus),
      });
    }

    if (carrier !== undefined) {
      shipment.carrier = carrier.trim();
    }

    if (trackingNumber !== undefined) {
      shipment.trackingNumber = trackingNumber.trim();
    }

    if (trackingUrl !== undefined) {
      shipment.trackingUrl = trackingUrl.trim();
    }

    if (estimatedDelivery !== undefined) {
      shipment.estimatedDelivery = estimatedDelivery
        ? new Date(estimatedDelivery)
        : null;
    }

    if (pickupAt !== undefined) {
      shipment.pickupAt = pickupAt ? new Date(pickupAt) : null;
    }

    await shipment.save();

    return res.status(200).json({
      success: true,
      message: "Shipping information updated successfully.",
      shipment,
    });
  } catch (error) {
    console.error("Update shipping info error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update shipping information.",
    });
  }
};

// ============================================================
// ADMIN - UPDATE SHIPPING STATUS
// ============================================================

exports.updateShippingStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location, description } = req.body;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipping status.",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    let shipment = await Shipment.findOne({
      order: orderId,
    });

    if (!shipment) {
      shipment = new Shipment({
        order: orderId,
        currentStatus: "ORDER_PLACED",
        timeline: [],
      });
    }

    const now = new Date();

    const existingTimeline = shipment.timeline.find(
      (item) => item.status === status
    );

    if (!existingTimeline) {
      shipment.timeline.push({
        status,
        title: STATUS_CONFIG[status].title,
        description:
          description?.trim() ||
          STATUS_CONFIG[status].description,
        location: location?.trim() || "",
        completedAt: now,
      });
    } else {
      existingTimeline.completedAt = now;

      if (description !== undefined) {
        existingTimeline.description =
          description.trim();
      }

      if (location !== undefined) {
        existingTimeline.location =
          location.trim();
      }
    }

    shipment.currentStatus = status;

    if (status === "SHIPPED") {
      shipment.shippedAt = shipment.shippedAt || now;
    }

    if (status === "DELIVERED") {
      shipment.deliveredAt = shipment.deliveredAt || now;
    }

    await shipment.save();

    const newOrderStatus =
      STATUS_CONFIG[status].orderStatus;

    if (order.orderStatus !== newOrderStatus) {
      order.orderStatus = newOrderStatus;
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: `Shipping status changed to ${STATUS_CONFIG[status].title}.`,
      shipment,
      order,
    });
  } catch (error) {
    console.error("Update shipping status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update shipping status.",
    });
  }
};