import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

const getAuthConfig = () => {
  const token = localStorage.getItem("bhb_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/* ----------------------------------
   CUSTOMER
---------------------------------- */

export const getMyOrders = async () => {
  const response = await axios.get(
    `${API_URL}/my`,
    getAuthConfig()
  );

  return response.data;
};

export const getMyOrderById = async (orderId) => {
  const response = await axios.get(
    `${API_URL}/my/${orderId}`,
    getAuthConfig()
  );

  return response.data;
};

/* ----------------------------------
   ADMIN
---------------------------------- */

export const getAllOrders = async (params = {}) => {
  const response = await axios.get(
    API_URL,
    {
      ...getAuthConfig(),
      params,
    }
  );

  return response.data;
};

export const getAdminOrderById = async (orderId) => {
  const response = await axios.get(
    `${API_URL}/${orderId}`,
    getAuthConfig()
  );

  return response.data;
};

export const updateOrderStatus = async (
  orderId,
  orderStatus
) => {
  const response = await axios.patch(
    `${API_URL}/${orderId}/status`,
    {
      orderStatus,
    },
    getAuthConfig()
  );

  return response.data;
};

export const updatePaymentStatus = async (
  orderId,
  paymentStatus
) => {
  const response = await axios.patch(
    `${API_URL}/${orderId}/payment-status`,
    {
      paymentStatus,
    },
    getAuthConfig()
  );

  return response.data;
};

export const updateShippingDetails = async (
  orderId,
  shippingData
) => {
  const response = await axios.patch(
    `${API_URL}/${orderId}/shipping`,
    shippingData,
    getAuthConfig()
  );

  return response.data;
};