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

/* =====================================================
   TOKEN
===================================================== */

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

/* =====================================================
   REQUEST INTERCEPTOR
===================================================== */

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

/* =====================================================
   STORE
===================================================== */

export const getStoreSettings =
  async () => {
    const response =
      await api.get(
        "/physical-store/store"
      );

    return (
      response?.data ||
      response
    );
  };

export const updateStoreSettings =
  async (data) => {
    const response =
      await api.patch(
        "/physical-store/admin/store",
        data
      );

    return (
      response?.data ||
      response
    );
  };

/* =====================================================
   PRODUCTS
===================================================== */

export const getStoreProducts =
  async (params = {}) => {
    const response =
      await api.get(
        "/physical-store/admin/products",
        {
          params,
        }
      );

    return (
      response?.data ||
      response
    );
  };

/* =====================================================
   DASHBOARD
===================================================== */

export const getPhysicalStoreDashboard =
  async () => {
    const response =
      await api.get(
        "/physical-store/admin/dashboard"
      );

    return (
      response?.data ||
      response
    );
  };

/* =====================================================
   OFFLINE SALES
===================================================== */

export const getOfflineSales =
  async (params = {}) => {
    const response =
      await api.get(
        "/physical-store/admin/sales",
        {
          params,
        }
      );

    return (
      response?.data ||
      response
    );
  };

export const createOfflineSale =
  async (data) => {
    const response =
      await api.post(
        "/physical-store/admin/sales",
        data
      );

    return (
      response?.data ||
      response
    );
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
        `/physical-store/admin/sales/${id}`
      );

    return (
      response?.data ||
      response
    );
  };

export default {
  getStoreSettings,
  updateStoreSettings,
  getStoreProducts,
  getPhysicalStoreDashboard,
  getOfflineSales,
  createOfflineSale,
  getOfflineSaleById,
};