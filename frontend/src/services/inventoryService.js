const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
};

const request = async (
  endpoint,
  options = {}
) => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Inventory request failed."
    );
  }

  return data;
};

/* =====================================================
   INVENTORY SUMMARY
===================================================== */

export const getInventorySummary = (
  threshold = 5
) => {
  return request(
    `/inventory/admin/summary?threshold=${encodeURIComponent(
      threshold
    )}`
  );
};

/* =====================================================
   INVENTORY LIST
===================================================== */

export const getInventory = ({
  search = "",
  status = "all",
  threshold = 5,
  page = 1,
  limit = 20,
} = {}) => {
  const params =
    new URLSearchParams();

  params.set(
    "search",
    search
  );

  params.set(
    "status",
    status
  );

  params.set(
    "threshold",
    threshold
  );

  params.set(
    "page",
    page
  );

  params.set(
    "limit",
    limit
  );

  return request(
    `/inventory/admin?${params.toString()}`
  );
};

/* =====================================================
   PRODUCT INVENTORY DETAILS
===================================================== */

export const getProductInventory = (
  productId
) => {
  return request(
    `/inventory/admin/${productId}`
  );
};

/* =====================================================
   UPDATE STOCK
===================================================== */

export const updateStock = (
  productId,
  payload
) => {
  return request(
    `/inventory/admin/${productId}/stock`,
    {
      method: "PATCH",

      body: JSON.stringify(
        payload
      ),
    }
  );
};

/* =====================================================
   INVENTORY MOVEMENTS
===================================================== */

export const getInventoryMovements = ({
  type = "all",
  page = 1,
  limit = 25,
} = {}) => {
  const params =
    new URLSearchParams();

  params.set(
    "type",
    type
  );

  params.set(
    "page",
    page
  );

  params.set(
    "limit",
    limit
  );

  return request(
    `/inventory/admin/movements?${params.toString()}`
  );
};