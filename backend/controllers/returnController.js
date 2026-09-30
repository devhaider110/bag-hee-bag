const mongoose = require("mongoose");

const ReturnRequest = require("../models/ReturnRequest");
const Order = require("../models/Order");

const cancellableStatuses = [
  "PENDING",
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
];

const allRequestStatuses = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "PICKUP_PENDING",
  "PICKED_UP",
  "RETURNED",
  "REFUND_PENDING",
  "REFUNDED",
];

const activeRequestStatuses = [
  "REQUESTED",
  "APPROVED",
  "CANCELLED",
  "PICKUP_PENDING",
  "PICKED_UP",
  "RETURNED",
  "REFUND_PENDING",
];

const normalizeType = (type) => {
  if (type === "CANCEL") {
    return "CANCELLATION";
  }

  return type;
};

const getRequestTypeFromPath = (req) => {
  const path = req.path || "";

  if (path.includes("/cancel")) {
    return "CANCELLATION";
  }

  return "RETURN";
};

// =====================================================
// CREATE REQUEST
// =====================================================

const createReturnRequest = async (req, res) => {
  try {
    const { orderId } = req.params;

    const {
      type: bodyType,
      reason,
      description,
    } = req.body || {};

    const type = normalizeType(
      bodyType || getRequestTypeFromPath(req)
    );

    if (
      !orderId ||
      !mongoose.Types.ObjectId.isValid(orderId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    if (!["CANCELLATION", "RETURN"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request type.",
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reason is required.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // =================================================
    // CANCELLATION
    // =================================================

    if (type === "CANCELLATION") {
      if (!cancellableStatuses.includes(order.orderStatus)) {
        return res.status(400).json({
          success: false,
          message:
            "This order cannot be cancelled because it has already been shipped or delivered.",
        });
      }
    }

    // =================================================
    // RETURN
    // =================================================

    if (type === "RETURN") {
      if (order.orderStatus !== "DELIVERED") {
        return res.status(400).json({
          success: false,
          message:
            "This order is not currently eligible for return.",
        });
      }

      const deliveryDate =
        order.shipping?.deliveredAt || null;

      if (!deliveryDate) {
        return res.status(400).json({
          success: false,
          message:
            "Delivery date is unavailable. Return eligibility cannot be verified.",
        });
      }

      const deliveredTime =
        new Date(deliveryDate).getTime();

      if (Number.isNaN(deliveredTime)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery date. Return eligibility cannot be verified.",
        });
      }

      const returnWindow =
        7 * 24 * 60 * 60 * 1000;

      if (
        Date.now() - deliveredTime >
        returnWindow
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Return window has expired. Returns are accepted within 7 days of delivery.",
        });
      }
    }

    // =================================================
    // EXISTING REQUEST
    // =================================================

    const existingRequest =
      await ReturnRequest.findOne({
        order: order._id,
        user: req.user._id,
        type,
        status: {
          $in: activeRequestStatuses,
        },
      });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message:
          type === "CANCELLATION"
            ? "A cancellation request already exists for this order."
            : "A return request already exists for this order.",
      });
    }

    // =================================================
    // REFUND
    // =================================================

    let refundAmount = 0;
    let refundMethod = "NA";

    if (order.paymentStatus === "PAID") {
      refundAmount =
        Number(order.totalAmount) || 0;

      refundMethod =
        order.paymentMethod === "RAZORPAY"
          ? "ORIGINAL_PAYMENT"
          : "MANUAL";
    }

    // =================================================
    // CREATE
    // =================================================

    const request =
      await ReturnRequest.create({
        order: order._id,
        user: req.user._id,
        type,
        reason: reason.trim(),
        description:
          description?.trim() || "",
        status: "REQUESTED",
        previousOrderStatus:
          order.orderStatus,
        refundAmount,
        refundMethod,
      });

    return res.status(201).json({
      success: true,
      message:
        type === "CANCELLATION"
          ? "Cancellation request submitted successfully."
          : "Return request submitted successfully.",
      request,
    });
  } catch (error) {
    console.error(
      "Create return request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create request.",
    });
  }
};

// =====================================================
// CUSTOMER - MY REQUESTS
// =====================================================

const getMyReturnRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await ReturnRequest.find({
        user: req.user._id,
      })
        .populate(
          "order",
          "_id totalAmount orderStatus paymentMethod paymentStatus shipping createdAt"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "Get my return requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load requests.",
    });
  }
};

// =====================================================
// CUSTOMER - SINGLE
// =====================================================

const getMyReturnRequestById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const request =
      await ReturnRequest.findOne({
        _id: id,
        user: req.user._id,
      })
        .populate("order")
        .populate(
          "user",
          "name username email phone"
        );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    return res.json({
      success: true,
      request,
    });
  } catch (error) {
    console.error(
      "Get return request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load request.",
    });
  }
};

// =====================================================
// ADMIN - ALL
// =====================================================

const getAllReturnRequests = async (
  req,
  res
) => {
  try {
    const {
      type,
      status,
      search,
    } = req.query;

    const filter = {};

    if (type) {
      const normalizedType =
        normalizeType(type);

      if (
        ["CANCELLATION", "RETURN"].includes(
          normalizedType
        )
      ) {
        filter.type = normalizedType;
      }
    }

    if (
      status &&
      allRequestStatuses.includes(status)
    ) {
      filter.status = status;
    }

    let requests =
      await ReturnRequest.find(filter)
        .populate(
          "user",
          "name username email phone"
        )
        .populate(
          "order",
          "_id totalAmount orderStatus paymentMethod paymentStatus createdAt shipping"
        )
        .sort({
          createdAt: -1,
        });

    if (search?.trim()) {
      const keyword =
        search.trim().toLowerCase();

      requests = requests.filter(
        (item) => {
          const orderId =
            item.order?._id
              ?.toString()
              .toLowerCase() || "";

          const userName =
            item.user?.name?.toLowerCase() ||
            "";

          const username =
            item.user?.username?.toLowerCase() ||
            "";

          const email =
            item.user?.email?.toLowerCase() ||
            "";

          const reason =
            item.reason?.toLowerCase() || "";

          return (
            orderId.includes(keyword) ||
            userName.includes(keyword) ||
            username.includes(keyword) ||
            email.includes(keyword) ||
            reason.includes(keyword)
          );
        }
      );
    }

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "Get all return requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load return requests.",
    });
  }
};

// =====================================================
// ADMIN - SINGLE
// =====================================================

const getAdminReturnRequestById =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid request ID.",
        });
      }

      const request =
        await ReturnRequest.findById(id)
          .populate(
            "user",
            "name username email phone"
          )
          .populate("order");

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found.",
        });
      }

      return res.json({
        success: true,
        request,
      });
    } catch (error) {
      console.error(
        "Get admin return request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load request.",
      });
    }
  };

// =====================================================
// ADMIN - UPDATE
// =====================================================

const updateReturnRequest = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      status,
      refundAmount,
      refundMethod,
      refundReference,
      adminNote,
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    if (
      status &&
      !allRequestStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status.",
      });
    }

    const request =
      await ReturnRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    // -------------------------------------------------
    // FINAL STATUS
    // -------------------------------------------------

    if (
      ["REJECTED", "REFUNDED"].includes(
        request.status
      ) &&
      status &&
      status !== request.status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This request has already reached a final status.",
      });
    }

    // -------------------------------------------------
    // VALID TRANSITIONS
    // -------------------------------------------------

    const validTransitions = {
      REQUESTED: [
        "APPROVED",
        "REJECTED",
      ],

      APPROVED:
        request.type === "RETURN"
          ? ["PICKUP_PENDING"]
          : ["CANCELLED"],

      CANCELLED: [
        "REFUND_PENDING",
      ],

      PICKUP_PENDING: [
        "PICKED_UP",
      ],

      PICKED_UP: [
        "RETURNED",
      ],

      RETURNED: [
        "REFUND_PENDING",
      ],

      REFUND_PENDING: [
        "REFUNDED",
      ],

      REJECTED: [],

      REFUNDED: [],
    };

    if (
      status &&
      status !== request.status
    ) {
      const allowed =
        validTransitions[
          request.status
        ] || [];

      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid status transition from ${request.status} to ${status}.`,
        });
      }
    }

    // -------------------------------------------------
    // FIELDS
    // -------------------------------------------------

    if (status) {
      request.status = status;
    }

    if (refundAmount !== undefined) {
      const amount =
        Number(refundAmount);

      if (!Number.isFinite(amount)) {
        return res.status(400).json({
          success: false,
          message: "Invalid refund amount.",
        });
      }

      request.refundAmount =
        Math.max(0, amount);
    }

    if (refundMethod) {
      const methods = [
        "ORIGINAL_PAYMENT",
        "BANK_TRANSFER",
        "UPI",
        "CASH",
        "MANUAL",
        "NA",
      ];

      if (!methods.includes(refundMethod)) {
        return res.status(400).json({
          success: false,
          message: "Invalid refund method.",
        });
      }

      request.refundMethod =
        refundMethod;
    }

    if (
      refundReference !== undefined
    ) {
      request.refundReference =
        String(
          refundReference
        ).trim();
    }

    if (adminNote !== undefined) {
      request.adminNote =
        String(adminNote).trim();
    }

    // -------------------------------------------------
    // TIMESTAMPS
    // -------------------------------------------------

    if (
      ["APPROVED", "REJECTED", "RETURNED", "CANCELLED"].includes(
        status
      )
    ) {
      request.processedAt =
        new Date();
    }

    if (status === "REFUNDED") {
      request.refundedAt =
        new Date();
    }

    await request.save();

    // =================================================
    // ORDER SYNC
    // =================================================

    const order =
      await Order.findById(
        request.order
      );

    if (order && status) {
      // -----------------------------------------------
      // CANCELLATION
      // -----------------------------------------------

      if (
        request.type === "CANCELLATION"
      ) {
        if (status === "APPROVED") {
          order.orderStatus =
            "CANCELLED";
        }

        if (status === "CANCELLED") {
          order.orderStatus =
            "CANCELLED";
        }

        if (status === "REJECTED") {
          order.orderStatus =
            request.previousOrderStatus ||
            "CONFIRMED";
        }

        if (
          status === "REFUND_PENDING" ||
          status === "REFUNDED"
        ) {
          order.orderStatus =
            "CANCELLED";
        }
      }

      // -----------------------------------------------
      // RETURN
      // -----------------------------------------------

      if (
        request.type === "RETURN"
      ) {
        if (
          status === "APPROVED" ||
          status === "PICKUP_PENDING" ||
          status === "PICKED_UP"
        ) {
          order.orderStatus =
            "RETURN_REQUESTED";
        }

        if (status === "RETURNED") {
          order.orderStatus =
            "RETURNED";
        }

        if (
          status === "REFUND_PENDING"
        ) {
          order.orderStatus =
            "RETURNED";
        }

        if (status === "REFUNDED") {
          order.orderStatus =
            "REFUNDED";
        }

        if (status === "REJECTED") {
          order.orderStatus =
            request.previousOrderStatus ||
            "DELIVERED";
        }
      }

      await order.save();
    }

    return res.json({
      success: true,
      message:
        "Request updated successfully.",
      request,
    });
  } catch (error) {
    console.error(
      "Update return request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update request.",
    });
  }
};

module.exports = {
  createReturnRequest,
  getMyReturnRequests,
  getMyReturnRequestById,
  getAllReturnRequests,
  getAdminReturnRequestById,
  updateReturnRequest,
};