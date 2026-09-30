import axios from "axios";

const API_URL = "http://localhost:5000/api/shipping";

const getAuthConfig = () => {
  const token = localStorage.getItem("bhb_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ============================================================
// CUSTOMER
// ============================================================

export const getMyTracking = async (orderId) => {
  const response = await axios.get(
    `${API_URL}/my/${orderId}`,
    getAuthConfig()
  );

  return response.data;
};

// ============================================================
// ADMIN
// ============================================================

export const getAdminShipping = async (orderId) => {
  const response = await axios.get(
    `${API_URL}/admin/${orderId}`,
    getAuthConfig()
  );

  return response.data;
};

export const updateShippingInfo = async (
  orderId,
  shippingData
) => {
  const response = await axios.patch(
    `${API_URL}/admin/${orderId}/info`,
    shippingData,
    getAuthConfig()
  );

  return response.data;
};

export const updateShippingStatus = async (
  orderId,
  statusData
) => {
  const response = await axios.patch(
    `${API_URL}/admin/${orderId}/status`,
    statusData,
    getAuthConfig()
  );

  return response.data;
};