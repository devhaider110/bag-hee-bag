const mongoose = require("mongoose");

const Refund = require("../models/Refund");
const ReturnRequest = require("../models/ReturnRequest");
const Order = require("../models/Order");

// =====================================================
// CUSTOMER - MY REFUNDS
// =====================================================

const getMyRefunds = async (req, res) => {
  try {
    const refunds =
      await Refund.find({
        user: req.user._id,
      })
        .populate(
          "order",
          "_id totalAmount orderStatus paymentMethod paymentStatus"
        )
        .populate(
          "returnRequest",
          "type reason status refundAmount refundMethod"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,
      refunds,
    });
  } catch (error) {
    console.error(
      "Get my refunds error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load refunds.",
    });
  }
};

// =====================================================
// CUSTOMER - REFUND BY ORDER
// =====================================================

const getMyRefundByOrderId = async (
  req,
  res
) => {
  try {
    const { orderId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(orderId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const refund =
      await Refund.findOne({
        order: orderId,
        user: req.user._id,
      })
        .populate(
          "order",
          "_id totalAmount orderStatus paymentMethod paymentStatus"
        )
        .populate(
          "returnRequest",
          "type reason status refundAmount refundMethod adminNote"
        )
        .sort({
          createdAt: -1,
        });

    if (!refund) {
      return res.json({
        success: true,
        refund: null,
      });
    }

    return res.json({
      success: true,
      refund,
    });
  } catch (error) {
    console.error(
      "Get refund by order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load refund.",
    });
  }
};

// =====================================================
// ADMIN - ALL REFUNDS
// =====================================================

const getAllRefunds = async (
  req,
  res
) => {
  try {
    const {
      status,
      search,
    } = req.query;

    const filter = {};

    if (
      status &&
      [
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "NOT_REQUIRED",
      ].includes(status)
    ) {
      filter.status = status;
    }

    let refunds =
      await Refund.find(filter)
        .populate(
          "user",
          "name username email phone"
        )
        .populate(
          "order",
          "_id totalAmount orderStatus paymentMethod paymentStatus"
        )
        .populate(
          "returnRequest",
          "type reason status refundAmount refundMethod"
        )
        .sort({
          createdAt: -1,
        });

    if (search?.trim()) {
      const keyword =
        search.trim().toLowerCase();

      refunds = refunds.filter(
        (item) => {
          const orderId =
            item.order?._id
              ?.toString()
              .toLowerCase() || "";

          const name =
            item.user?.name?.toLowerCase() ||
            "";

          const username =
            item.user?.username?.toLowerCase() ||
            "";

          const email =
            item.user?.email?.toLowerCase() ||
            "";

          const transaction =
            item.transactionId
              ?.toLowerCase() || "";

          return (
            orderId.includes(keyword) ||
            name.includes(keyword) ||
            username.includes(keyword) ||
            email.includes(keyword) ||
            transaction.includes(keyword)
          );
        }
      );
    }

    return res.json({
      success: true,
      refunds,
    });
  } catch (error) {
    console.error(
      "Get all refunds error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load refunds.",
    });
  }
};

// =====================================================
// ADMIN - UPDATE REFUND
// =====================================================

const updateRefundStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      status,
      transactionId,
      adminNote,
    } = req.body || {};

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund ID.",
      });
    }

    const allowedStatuses = [
      "PENDING",
      "PROCESSING",
      "COMPLETED",
      "FAILED",
      "NOT_REQUIRED",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund status.",
      });
    }

    const refund =
      await Refund.findById(id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found.",
      });
    }

    if (
      ["COMPLETED", "NOT_REQUIRED"].includes(
        refund.status
      ) &&
      status !== refund.status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This refund has already reached a final status.",
      });
    }

    const transitions = {
      PENDING: [
        "PROCESSING",
        "FAILED",
        "NOT_REQUIRED",
      ],

      PROCESSING: [
        "COMPLETED",
        "FAILED",
      ],

      FAILED: [
        "PENDING",
        "PROCESSING",
      ],

      COMPLETED: [],

      NOT_REQUIRED: [],
    };

    if (
      status !== refund.status &&
      !(
        transitions[refund.status] || []
      ).includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid refund transition from ${refund.status} to ${status}.`,
      });
    }

    refund.status = status;

    if (
      transactionId !== undefined
    ) {
      refund.transactionId =
        String(transactionId).trim();
    }

    if (adminNote !== undefined) {
      refund.adminNote =
        String(adminNote).trim();
    }

    if (
      status === "PROCESSING"
    ) {
      refund.processedAt =
        new Date();
    }

    if (
      status === "COMPLETED"
    ) {
      refund.completedAt =
        new Date();
    }

    await refund.save();

    // =================================================
    // RETURN REQUEST SYNC
    // =================================================

    const request =
      await ReturnRequest.findById(
        refund.returnRequest
      );

    if (request) {
      if (status === "COMPLETED") {
        request.status =
          "REFUNDED";

        request.refundedAt =
          new Date();

        if (transactionId !== undefined) {
          request.refundReference =
            String(transactionId).trim();
        }
      }

      if (
        status === "FAILED" &&
        request.status ===
          "REFUNDED"
      ) {
        request.status =
          "REFUND_PENDING";

        request.refundedAt = null;
      }

      await request.save();
    }

    // =================================================
    // ORDER SYNC
    // =================================================

    if (status === "COMPLETED") {
      const order =
        await Order.findById(
          refund.order
        );

      if (order) {
        order.orderStatus =
          "REFUNDED";

        await order.save();
      }
    }

    return res.json({
      success: true,
      message:
        "Refund updated successfully.",
      refund,
    });
  } catch (error) {
    console.error(
      "Update refund status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update refund.",
    });
  }
};

module.exports = {
  getMyRefunds,
  getMyRefundByOrderId,
  getAllRefunds,
  updateRefundStatus,
};