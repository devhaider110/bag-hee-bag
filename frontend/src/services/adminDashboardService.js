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
   HEADERS
===================================================== */

const getHeaders = () => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return headers;
};

/* =====================================================
   API REQUEST
===================================================== */

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    }
  );

  const data =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong."
    );
  }

  return data;
};

/* =====================================================
   QUERY BUILDER
===================================================== */

const buildQuery = ({
  range = "30d",
  startDate,
  endDate,
} = {}) => {
  const params =
    new URLSearchParams();

  params.set("range", range);

  if (startDate) {
    params.set(
      "startDate",
      startDate
    );
  }

  if (endDate) {
    params.set(
      "endDate",
      endDate
    );
  }

  return params.toString();
};

/* =====================================================
   SUMMARY
===================================================== */

export const getDashboardSummary = (
  filters = {}
) => {
  return apiRequest(
    `/admin/dashboard/summary?${buildQuery(
      filters
    )}`
  );
};

/* =====================================================
   SALES
===================================================== */

export const getSalesAnalytics = (
  filters = {}
) => {
  return apiRequest(
    `/admin/dashboard/sales?${buildQuery(
      filters
    )}`
  );
};

/* =====================================================
   ORDERS
===================================================== */

export const getOrderAnalytics = (
  filters = {}
) => {
  return apiRequest(
    `/admin/dashboard/orders?${buildQuery(
      filters
    )}`
  );
};

/* =====================================================
   PRODUCTS
===================================================== */

export const getProductAnalytics = (
  filters = {}
) => {
  return apiRequest(
    `/admin/dashboard/products?${buildQuery(
      filters
    )}`
  );
};

/* =====================================================
   CATEGORIES
===================================================== */

export const getCategoryAnalytics = (
  filters = {}
) => {
  return apiRequest(
    `/admin/dashboard/categories?${buildQuery(
      filters
    )}`
  );
};

/* =====================================================
   CUSTOMERS
===================================================== */

export const getCustomerAnalytics = (
  filters = {}
) => {
  return apiRequest(
    `/admin/dashboard/customers?${buildQuery(
      filters
    )}`
  );
};

/* =====================================================
   ACTIVITY
===================================================== */

export const getDashboardActivity = () => {
  return apiRequest(
    "/admin/dashboard/activity"
  );
};

/* =====================================================
   ALL DASHBOARD DATA
===================================================== */

export const getDashboardData = async (
  filters = {}
) => {
  const [
    summary,
    sales,
    orders,
    products,
    categories,
    customers,
    activity,
  ] = await Promise.all([
    getDashboardSummary(filters),

    getSalesAnalytics(filters),

    getOrderAnalytics(filters),

    getProductAnalytics(filters),

    getCategoryAnalytics(filters),

    getCustomerAnalytics(filters),

    getDashboardActivity(),
  ]);

  return {
    summary,
    sales,
    orders,
    products,
    categories,
    customers,
    activity,
  };
};

export default {
  getDashboardSummary,
  getSalesAnalytics,
  getOrderAnalytics,
  getProductAnalytics,
  getCategoryAnalytics,
  getCustomerAnalytics,
  getDashboardActivity,
  getDashboardData,
};