import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEYS = ["bhb_token", "token", "accessToken"];

/*
|--------------------------------------------------------------------------
| Token Helper
|--------------------------------------------------------------------------
*/

/**
 * Retrieves the auth token from localStorage or sessionStorage
 */
export const getToken = () => {
  for (const key of TOKEN_KEYS) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) return token;
  }
  return "";
};

/**
 * Removes saved auth tokens from storage
 */
export const clearToken = () => {
  TOKEN_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10s request timeout
});

/*
|--------------------------------------------------------------------------
| Interceptors
|--------------------------------------------------------------------------
*/

// Automatically attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for data unwrapping & global error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      // Optional: Dispatch event or redirect to login
      // window.location.href = "/login";
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected API error occurred.";

    return Promise.reject(new Error(message));
  }
);

/*
|--------------------------------------------------------------------------
| CUSTOMER INVOICES
|--------------------------------------------------------------------------
*/

/**
 * Get logged-in customer's invoices
 * @param {Object} [params] - Query parameters (page, limit, status, etc.)
 */
export const getMyInvoices = async (params = {}) => {
  return api.get("/invoices", { params });
};

/**
 * Get invoice for a specific order
 * @param {string} orderId
 */
export const getMyInvoiceByOrder = async (orderId) => {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }
  return api.get(`/invoices/${orderId}`);
};

/**
 * Get printable invoice data
 * @param {string} orderId
 */
export const getInvoicePrintData = async (orderId) => {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }
  return api.get(`/invoices/${orderId}/print`);
};

/*
|--------------------------------------------------------------------------
| ADMIN INVOICES
|--------------------------------------------------------------------------
*/

/**
 * Get all invoices (Admin)
 * @param {Object} [params] - Filter/pagination parameters
 */
export const getAdminInvoices = async (params = {}) => {
  return api.get("/invoices/admin/list", { params });
};

/**
 * Get admin invoice details by order ID
 * @param {string} orderId
 */
export const getAdminInvoiceByOrder = async (orderId) => {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }
  return api.get(`/invoices/admin/${orderId}`);
};

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

const invoiceApi = {
  getToken,
  clearToken,
  getMyInvoices,
  getMyInvoiceByOrder,
  getInvoicePrintData,
  getAdminInvoices,
  getAdminInvoiceByOrder,
};

export default invoiceApi;