import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getToken = () => {
  return (
    localStorage.getItem("bhb_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("bhb_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
};

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

export const getOfflineProducts =
  async (params = {}) => {
    const response =
      await api.get(
        "/offline-sales/admin/products",
        {
          params,
        }
      );

    return response?.data || response;
  };

export const createOfflineSale =
  async (data) => {
    const response =
      await api.post(
        "/offline-sales/admin",
        data
      );

    return response?.data || response;
  };

export const getOfflineSales =
  async (params = {}) => {
    const response =
      await api.get(
        "/offline-sales/admin",
        {
          params,
        }
      );

    return response?.data || response;
  };

export const getOfflineSaleById =
  async (id) => {
    if (!id) {
      throw new Error(
        "Sale ID is required."
      );
    }

    const response =
      await api.get(
        `/offline-sales/admin/${id}`
      );

    return response?.data || response;
  };

export const getOfflineSummary =
  async (date) => {
    const response =
      await api.get(
        "/offline-sales/admin/summary",
        {
          params: date
            ? { date }
            : {},
        }
      );

    return response?.data || response;
  };

export default {
  getOfflineProducts,
  createOfflineSale,
  getOfflineSales,
  getOfflineSaleById,
  getOfflineSummary,
};