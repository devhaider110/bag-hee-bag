import React, { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notificationService";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications({
        page: 1,
        limit: 50,
      });

      setNotifications(data.notifications || []);
      setUnreadCount(
        data.unreadCount ??
          (data.notifications || []).filter(
            (notification) => !notification.isRead
          ).length
      );
    } catch (err) {
      console.error("Load notifications error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (err) {
      console.error("Mark notification read error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setActionLoading(true);

      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        "Mark all notifications read error:",
        err
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);

      const deletedNotification = notifications.find(
        (notification) => notification._id === notificationId
      );

      setNotifications((previous) =>
        previous.filter(
          (notification) => notification._id !== notificationId
        )
      );

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );
      }
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-4 text-xs font-medium text-gray-500 transition hover:text-[#d4af37]"
            >
              ← Back to Home
            </button>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
              BAG HEE BAG
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Stay updated with your orders, offers, account
              activity and important updates.
            </p>
          </div>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || actionLoading}
            className="rounded-xl border border-[#d4af37]/25 px-4 py-2.5 text-sm font-medium text-[#d4af37] transition hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {actionLoading
              ? "Updating..."
              : "Mark all as read"}
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-wider text-gray-600">
              Total
            </p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#d4af37]/15 bg-[#d4af37]/[0.04] p-4">
            <p className="text-xs uppercase tracking-wider text-gray-600">
              Unread
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#d4af37]">
              {unreadCount}
            </p>
          </div>

          <div className="hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:block">
            <p className="text-xs uppercase tracking-wider text-gray-600">
              Status
            </p>

            <p className="mt-1 text-sm font-medium text-gray-300">
              {unreadCount > 0
                ? "New updates"
                : "All caught up"}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37]" />

              <p className="mt-4 text-sm text-gray-500">
                Loading notifications...
              </p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-8 w-8 text-[#d4af37]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17H9m10-2.5c0 1.38-.94 2.5-2.1 2.5H7.1C5.94 17 5 15.88 5 14.5c0-1.82.58-3.42 1.47-4.74A5.99 5.99 0 0 1 12 7a5.99 5.99 0 0 1 5.53 2.76A8.85 8.85 0 0 1 19 14.5ZM9.75 17a2.25 2.25 0 0 0 4.5 0"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              No notifications yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
              When there is an update about your orders,
              account or special offers, it will appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-6 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e2c45f]"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Notification List */
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
            {notifications.map((notification, index) => (
              <div
                key={notification._id}
                className={`group flex gap-4 px-4 py-5 transition sm:px-6 ${
                  index !== notifications.length - 1
                    ? "border-b border-white/5"
                    : ""
                } ${
                  notification.isRead
                    ? "hover:bg-white/[0.025]"
                    : "bg-[#d4af37]/[0.045] hover:bg-[#d4af37]/[0.07]"
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                      notification.isRead
                        ? "border-white/10 bg-white/[0.04]"
                        : "border-[#d4af37]/30 bg-[#d4af37]/10"
                    }`}
                  >
                    <span className="text-lg">
                      {notification.icon || "🔔"}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <button
                  type="button"
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm sm:text-base ${
                          notification.isRead
                            ? "font-medium text-gray-300"
                            : "font-semibold text-white"
                        }`}
                      >
                        {notification.title ||
                          "Notification"}
                      </h3>

                      {!notification.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                      )}
                    </div>

                    <span className="text-[11px] text-gray-600">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                    {notification.message || ""}
                  </p>

                  {notification.type && (
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d4af37]/60">
                      {notification.type.replaceAll(
                        "_",
                        " "
                      )}
                    </p>
                  )}
                </button>

                {/* Actions */}
                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkAsRead(notification._id)
                      }
                      className="rounded-lg px-2 py-1 text-[10px] text-[#d4af37] transition hover:bg-[#d4af37]/10"
                      title="Mark as read"
                    >
                      Read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(notification._id)
                    }
                    className="rounded-lg px-2 py-1 text-[10px] text-gray-600 opacity-100 transition hover:bg-red-500/10 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Delete notification"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;