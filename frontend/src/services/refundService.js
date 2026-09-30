import axios from "axios";

const API_URL =
  "http://localhost:5000/api/refunds";

const getAuthConfig = () => {
  const token =
    localStorage.getItem("bhb_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMyRefunds =
  async () => {
    const response = await axios.get(
      `${API_URL}/my`,
      getAuthConfig()
    );

    return response.data;
  };

export const getMyRefundByOrderId =
  async (orderId) => {
    const response = await axios.get(
      `${API_URL}/order/${orderId}`,
      getAuthConfig()
    );

    return response.data;
  };

export const getAllRefunds =
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

export const updateRefundStatus =
  async (refundId, data) => {
    const response = await axios.patch(
      `${API_URL}/admin/${refundId}/status`,
      data,
      getAuthConfig()
    );

    return response.data;
  };