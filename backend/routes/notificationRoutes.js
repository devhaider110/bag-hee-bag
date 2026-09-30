const express = require("express");

const {
  getNotifications,
  getUnreadNotificationCount,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// CUSTOMER
router.get(
  "/unread-count",
  protect,
  getUnreadNotificationCount
);

router.get(
  "/",
  protect,
  getNotifications
);

router.get(
  "/:id",
  protect,
  getNotificationById
);

router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);

router.delete(
  "/read",
  protect,
  deleteReadNotifications
);

router.delete(
  "/:id",
  protect,
  deleteNotification
);

module.exports = router;