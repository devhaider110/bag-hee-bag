import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type":
      "application/json",
  },
});

/* =====================================================
   TOKEN
===================================================== */

const getToken = () => {
  return (
    localStorage.getItem(
      "bhb_token"
    ) ||
    localStorage.getItem(
      "token"
    ) ||
    localStorage.getItem(
      "accessToken"
    ) ||
    sessionStorage.getItem(
      "bhb_token"
    ) ||
    sessionStorage.getItem(
      "token"
    ) ||
    sessionStorage.getItem(
      "accessToken"
    ) ||
    ""
  );
};

/* =====================================================
   AUTH INTERCEPTOR
===================================================== */

api.interceptors.request.use(
  (config) => {
    const token =
      getToken();

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
   ADMIN SETTINGS
===================================================== */

export const getAdminStoreSettings =
  async () => {
    const response =
      await api.get(
        "/store/admin"
      );

    return (
      response?.data ||
      response
    );
  };

export const updateAdminStoreSettings =
  async (data) => {
    const response =
      await api.patch(
        "/store/admin",
        data
      );

    return (
      response?.data ||
      response
    );
  };

/* =====================================================
   PUBLIC SETTINGS
===================================================== */

export const getPublicStoreSettings =
  async () => {
    const response =
      await api.get(
        "/store/public"
      );

    return (
      response?.data ||
      response
    );
  };

export default {
  getAdminStoreSettings,
  updateAdminStoreSettings,
  getPublicStoreSettings,
};