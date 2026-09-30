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
  }
);

export const getAdminSystemSettings =
  async () => {
    const response =
      await api.get(
        "/system-settings/admin"
      );

    return response.data;
  };

export const updateAdminSystemSettings =
  async (data) => {
    const response =
      await api.patch(
        "/system-settings/admin",
        data
      );

    return response.data;
  };

export const getPublicSystemSettings =
  async () => {
    const response =
      await api.get(
        "/system-settings/public"
      );

    return response.data;
  };

export const updateProductSEO =
  async (
    productId,
    seo
  ) => {
    const response =
      await api.patch(
        `/system-settings/admin/products/${productId}/seo`,
        {
          seo,
        }
      );

    return response.data;
  };

export const updateCategorySEO =
  async (
    categoryId,
    seo
  ) => {
    const response =
      await api.patch(
        `/system-settings/admin/categories/${categoryId}/seo`,
        {
          seo,
        }
      );

    return response.data;
  };

export default {
  getAdminSystemSettings,
  updateAdminSystemSettings,
  getPublicSystemSettings,
  updateProductSEO,
  updateCategorySEO,
};