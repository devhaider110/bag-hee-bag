import axios from "axios";

const API_URL =
  "http://localhost:5000/api/admin/security";

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

// =========================
// SECURITY SUMMARY
// =========================

export const getSecuritySummary =
  async (token) => {
    const response =
      await axios.get(
        `${API_URL}/summary`,
        {
          headers:
            getAuthHeaders(token),
        }
      );

    return response.data;
  };

// =========================
// USERS
// =========================

export const getSecurityUsers =
  async (
    token,
    params = {}
  ) => {
    const response =
      await axios.get(
        `${API_URL}/users`,
        {
          headers:
            getAuthHeaders(token),
          params,
        }
      );

    return response.data;
  };

// =========================
// USER STATUS
// =========================

export const updateUserStatus =
  async (
    token,
    userId,
    isActive
  ) => {
    const response =
      await axios.patch(
        `${API_URL}/users/${userId}/status`,
        {
          isActive,
        },
        {
          headers:
            getAuthHeaders(token),
        }
      );

    return response.data;
  };

// =========================
// USER ROLE
// =========================

export const updateUserRole =
  async (
    token,
    userId,
    role
  ) => {
    const response =
      await axios.patch(
        `${API_URL}/users/${userId}/role`,
        {
          role,
        },
        {
          headers:
            getAuthHeaders(token),
        }
      );

    return response.data;
  };

// =========================
// ADMIN PERMISSIONS
// =========================

export const updateAdminPermissions =
  async (
    token,
    userId,
    permissions
  ) => {
    const response =
      await axios.patch(
        `${API_URL}/users/${userId}/permissions`,
        {
          permissions,
        },
        {
          headers:
            getAuthHeaders(token),
        }
      );

    return response.data;
  };

// =========================
// RESET PASSWORD
// =========================

export const resetUserPassword =
  async (
    token,
    userId,
    newPassword
  ) => {
    const response =
      await axios.patch(
        `${API_URL}/users/${userId}/password`,
        {
          newPassword,
        },
        {
          headers:
            getAuthHeaders(token),
        }
      );

    return response.data;
  };

// =========================
// ACTIVITY LOGS
// =========================

export const getAdminActivities =
  async (
    token,
    params = {}
  ) => {
    const response =
      await axios.get(
        `${API_URL}/activities`,
        {
          headers:
            getAuthHeaders(token),
          params,
        }
      );

    return response.data;
  };

// =========================
// SECURITY INFO
// =========================

export const getSecurityInfo =
  async (token) => {
    const response =
      await axios.get(
        `${API_URL}/info`,
        {
          headers:
            getAuthHeaders(token),
        }
      );

    return response.data;
  };