import axios from "axios";

const API_URL =
  "http://localhost:5000/api/returns";

const getAuthConfig = () => {
  const token =
    localStorage.getItem("bhb_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// CUSTOMER

export const cancelOrder = async (
  orderId,
  data
) => {
  const response = await axios.post(
    `${API_URL}/${orderId}/cancel`,
    {
      ...data,
      type: "CANCELLATION",
    },
    getAuthConfig()
  );

  return response.data;
};

export const createReturnRequest = async (
  orderId,
  data
) => {
  const response = await axios.post(
    `${API_URL}/${orderId}/request`,
    {
      ...data,
      type: "RETURN",
    },
    getAuthConfig()
  );

  return response.data;
};

export const getMyReturnRequests =
  async () => {
    const response = await axios.get(
      `${API_URL}/my`,
      getAuthConfig()
    );

    return response.data;
  };

export const getMyReturnRequest =
  async (id) => {
    const response = await axios.get(
      `${API_URL}/my/${id}`,
      getAuthConfig()
    );

    return response.data;
  };

// ADMIN

export const getAllReturnRequests =
  async (params = {}) => {
    const response = await axios.get(
      `${API_URL}/admin`,
      {
        ...getAuthConfig(),
        params,
      }
    );

    return response.data;
  };

export const getAdminReturnRequest =
  async (id) => {
    const response = await axios.get(
      `${API_URL}/admin/${id}`,
      getAuthConfig()
    );

    return response.data;
  };

export const updateReturnStatus =
  async (id, data) => {
    const response = await axios.patch(
      `${API_URL}/admin/${id}/status`,
      data,
      getAuthConfig()
    );

    return response.data;
  };