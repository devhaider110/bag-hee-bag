import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/notifications";

const NotificationBell = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getAuthConfig = () => {
    const token = localStorage.getItem("bhb_token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}?page=1&limit=5`,
        getAuthConfig()
      );

      if (!response.ok) {
        throw new Error("Failed to load notifications");
      }

      const data = await response.json();

      setNotifications(data.notifications || []);
      setUnreadCount(
        data.unreadCount ??
          (data.notifications || []).filter(
            (notification) => !notification.isRead
          ).length
      );
    } catch (error) {
      console.error("Notification load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    if (!user) {
      return undefined;
    }

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_URL}/${notificationId}/read`,
        {
          method: "PATCH",
          ...getAuthConfig(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error("Mark notification read error:", error);
    }
  };

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setIsOpen(false);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    return notificationDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((previous) => !previous);

          if (!isOpen) {
            loadNotifications();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/20 bg-[#111] text-[#d4af37] transition-all duration-300 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10 hover:shadow-[0_0_18px_rgba(212,175,55,0.15)]"
        aria-label="Notifications"
        title="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17H9m10-2.5c0 1.38-.94 2.5-2.1 2.5H7.1C5.94 17 5 15.88 5 14.5c0-1.82.58-3.42 1.47-4.74A5.99 5.99 0 0 1 12 7a5.99 5.99 0 0 1 5.53 2.76A8.85 8.85 0 0 1 19 14.5ZM9.75 17a2.25 2.25 0 0 0 4.5 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#080808] bg-[#d4af37] px-1 text-[10px] font-bold leading-none text-black">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-3 w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#0d0d0d] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Notifications
                </h3>

                <p className="mt-0.5 text-[11px] text-gray-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount > 1 ? "s" : ""
                      }`
                    : "You're all caught up"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/notifications")}
                className="text-xs font-medium text-[#d4af37] transition hover:text-[#f0d889]"
              >
                View all
              </button>
            </div>

            {/* Notifications */}
            <div className="max-h-[390px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center px-4 py-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37]" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-6 w-6 text-[#d4af37]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17H9m10-2.5c0 1.38-.94 2.5-2.1 2.5H7.1C5.94 17 5 15.88 5 14.5c0-1.82.58-3.42 1.47-4.74A5.99 5.99 0 0 1 12 7a5.99 5.99 0 0 1 5.53 2.76A8.85 8.85 0 0 1 19 14.5ZM9.75 17a2.25 2.25 0 0 0 4.5 0"
                      />
                    </svg>
                  </div>

                  <p className="text-sm text-gray-300">
                    No notifications yet
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    We'll let you know when something important happens.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    className={`flex w-full gap-3 border-b border-white/5 px-4 py-4 text-left transition ${
                      notification.isRead
                        ? "bg-transparent hover:bg-white/[0.03]"
                        : "bg-[#d4af37]/[0.06] hover:bg-[#d4af37]/[0.1]"
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                          notification.isRead
                            ? "border-white/10 bg-white/[0.04]"
                            : "border-[#d4af37]/30 bg-[#d4af37]/10"
                        }`}
                      >
                        <span className="text-sm">
                          {notification.icon || "🔔"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`line-clamp-1 text-sm ${
                            notification.isRead
                              ? "font-medium text-gray-300"
                              : "font-semibold text-white"
                          }`}
                        >
                          {notification.title || "Notification"}
                        </p>

                        <span className="flex-shrink-0 text-[10px] text-gray-600">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                        {notification.message || ""}
                      </p>

                      {!notification.isRead && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                          <span className="text-[10px] font-medium text-[#d4af37]">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-white/10 px-4 py-3">
                <button
                  type="button"
                  onClick={() => navigate("/notifications")}
                  className="w-full rounded-xl border border-[#d4af37]/20 px-4 py-2.5 text-xs font-semibold text-[#d4af37] transition hover:border-[#d4af37]/40 hover:bg-[#d4af37]/10"
                >
                  Open Notification Center
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;