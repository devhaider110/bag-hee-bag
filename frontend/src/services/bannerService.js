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
   PUBLIC
===================================================== */

export const getActiveBanners =
  async () => {
    const response =
      await api.get(
        "/banners/active"
      );

    return (
      response?.data ||
      response
    );
  };

/* =====================================================
   ADMIN - LIST
===================================================== */

export const getAdminBanners =
  async (params = {}) => {
    const response =
      await api.get(
        "/banners/admin",
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
   ADMIN - SINGLE
===================================================== */

export const getAdminBannerById =
  async (id) => {
    if (!id) {
      throw new Error(
        "Banner ID is required."
      );
    }

    const response =
      await api.get(
        `/banners/admin/${id}`
      );

    return (
      response?.data ||
      response
    );
  };

/* =====================================================
   ADMIN - IMAGE UPLOAD
===================================================== */

export const uploadBannerImage =
  async (file) => {
    if (!file) {
      throw new Error(
        "Please select an image."
      );
    }

    if (
      !file.type ||
      !file.type.startsWith(
        "image/"
      )
    ) {
      throw new Error(
        "Please select a valid image file."
      );
    }

    /*
     * 10 MB client-side protection.
     */

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error(
        "Image size must be 10 MB or less."
      );
    }

    const formData =
      new FormData();

    /*
     * IMPORTANT:
     * Backend multer expects field name:
     * "image"
     */

    formData.append(
      "image",
      file
    );

    const response =
      await api.post(
        "/banners/admin/upload",
        formData,
        {
          /*
           * Do NOT manually set
           * Content-Type here.
           *
           * Axios/browser will automatically
           * add multipart/form-data boundary.
           */
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return (
      response?.data ||
      response
    );
  };

/* =====================================================
   ADMIN - CREATE
===================================================== */

export const createBanner =
  async (data) => {
    const response =
      await api.post(
        "/banners/admin",
        data
      );

    return (
      response?.data ||
      response
    );
  };

/* =====================================================
   ADMIN - UPDATE
===================================================== */

export const updateBanner =
  async (id, data) => {
    if (!id) {
      throw new Error(
        "Banner ID is required."
      );
    }

    const response =
      await api.patch(
        `/banners/admin/${id}`,
        data
      );

    return (
      response?.data ||
      response
    );
  };

/* =====================================================
   ADMIN - TOGGLE
===================================================== */

export const toggleBannerStatus =
  async (id) => {
    if (!id) {
      throw new Error(
        "Banner ID is required."
      );
    }

    const response =
      await api.patch(
        `/banners/admin/${id}/toggle`
      );

    return (
      response?.data ||
      response
    );
  };

/* =====================================================
   ADMIN - DELETE
===================================================== */

export const deleteBanner =
  async (id) => {
    if (!id) {
      throw new Error(
        "Banner ID is required."
      );
    }

    const response =
      await api.delete(
        `/banners/admin/${id}`
      );

    return (
      response?.data ||
      response
    );
  };

/* =====================================================
   DEFAULT
===================================================== */

export default {
  getActiveBanners,
  getAdminBanners,
  getAdminBannerById,
  uploadBannerImage,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  deleteBanner,
};