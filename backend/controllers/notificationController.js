const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 20,
        1
      ),
      100
    );

    const skip = (page - 1) * limit;

    const userId = req.user._id;

    const [notifications, total, unreadCount] =
      await Promise.all([
        Notification.find({
          user: userId,
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("order", "_id orderNumber orderStatus")
          .populate(
            "returnRequest",
            "_id type status refundAmount"
          )
          .populate(
            "refund",
            "_id amount status transactionId"
          )
          .lean(),

        Notification.countDocuments({
          user: userId,
        }),

        Notification.countDocuments({
          user: userId,
          isRead: false,
        }),
      ]);

    return res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load notifications.",
    });
  }
};

// Get unread notification count
const getUnreadNotificationCount = async (
  req,
  res
) => {
  try {
    const unreadCount =
      await Notification.countDocuments({
        user: req.user._id,
        isRead: false,
      });

    return res.status(200).json({
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get unread notification count error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load unread notification count.",
    });
  }
};

// Get single notification
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid notification ID.",
      });
    }

    const notification =
      await Notification.findOne({
        _id: id,
        user: req.user._id,
      })
        .populate(
          "order",
          "_id orderNumber orderStatus"
        )
        .populate(
          "returnRequest",
          "_id type status refundAmount"
        )
        .populate(
          "refund",
          "_id amount status transactionId"
        );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      notification,
    });
  } catch (error) {
    console.error(
      "Get notification error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load notification.",
    });
  }
};

// Mark one notification as read
const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid notification ID.",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: id,
          user: req.user._id,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to mark notification as read.",
    });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    const result =
      await Notification.updateMany(
        {
          user: req.user._id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );

    return res.status(200).json({
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to mark all notifications as read.",
    });
  }
};

// Delete one notification
const deleteNotification = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid notification ID.",
      });
    }

    const notification =
      await Notification.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      message: "Notification deleted.",
    });
  } catch (error) {
    console.error(
      "Delete notification error:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete notification.",
    });
  }
};

// Delete all read notifications
const deleteReadNotifications = async (
  req,
  res
) => {
  try {
    const result =
      await Notification.deleteMany({
        user: req.user._id,
        isRead: true,
      });

    return res.status(200).json({
      message: "Read notifications deleted.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(
      "Delete read notifications error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete read notifications.",
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadNotificationCount,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
};