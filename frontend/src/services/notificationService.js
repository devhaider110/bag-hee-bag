import axios from "axios";

const API_URL = "http://localhost:5000/api/notifications";

const getAuthConfig = () => {
  const token = localStorage.getItem("bhb_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get logged-in user's notifications
export const getNotifications = async (params = {}) => {
  const response = await axios.get(API_URL, {
    ...getAuthConfig(),
    params,
  });

  return response.data;
};

// Get unread notification count
export const getUnreadNotificationCount = async () => {
  const response = await axios.get(
    `${API_URL}/unread-count`,
    getAuthConfig()
  );

  return response.data;
};

// Get single notification
export const getNotificationById = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getAuthConfig()
  );

  return response.data;
};

// Mark one notification as read
export const markNotificationAsRead = async (id) => {
  const response = await axios.patch(
    `${API_URL}/${id}/read`,
    {},
    getAuthConfig()
  );

  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await axios.patch(
    `${API_URL}/read-all`,
    {},
    getAuthConfig()
  );

  return response.data;
};

// Delete one notification
export const deleteNotification = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getAuthConfig()
  );

  return response.data;
};

// Delete all read notifications
export const deleteReadNotifications = async () => {
  const response = await axios.delete(
    `${API_URL}/read`,
    getAuthConfig()
  );

  return response.data;
};