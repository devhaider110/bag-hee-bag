import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

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
    ""
  );
};

/* =====================================================
   API
===================================================== */

const api = axios.create({
  baseURL: API_BASE_URL,
});

/* =====================================================
   AUTH INTERCEPTOR
===================================================== */

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* =====================================================
   REPORT SUMMARY
===================================================== */

export const getReportSummary = (
  params = {}
) => {
  return api.get(
    "/reports/summary",
    {
      params,
    }
  );
};

/* =====================================================
   SALES REPORT
===================================================== */

export const getSalesReport = (
  params = {}
) => {
  return api.get(
    "/reports/sales",
    {
      params,
    }
  );
};

/* =====================================================
   PRODUCT REPORT
===================================================== */

export const getProductReport = (
  params = {}
) => {
  return api.get(
    "/reports/products",
    {
      params,
    }
  );
};

/* =====================================================
   CATEGORY REPORT
===================================================== */

export const getCategoryReport = (
  params = {}
) => {
  return api.get(
    "/reports/categories",
    {
      params,
    }
  );
};

/* =====================================================
   CUSTOMER REPORT
===================================================== */

export const getCustomerReport = (
  params = {}
) => {
  return api.get(
    "/reports/customers",
    {
      params,
    }
  );
};

/* =====================================================
   ALL REPORTS
===================================================== */

export const getAllReports = (
  params = {}
) => {
  return Promise.all([
    getReportSummary(params),
    getSalesReport(params),
    getProductReport(params),
    getCategoryReport(params),
    getCustomerReport(params),
  ]);
};

export default api;