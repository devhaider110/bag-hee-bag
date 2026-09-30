import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const getToken = () => {
  return localStorage.getItem(
    "bhb_token"
  );
};

const getConfig = () => {
  const token =
    getToken();

  return {
    headers: {
      Authorization: token
        ? `Bearer ${token}`
        : "",
    },
  };
};

/* =========================================================
   GET ALL CUSTOMERS
========================================================= */

export const getCustomers =
  async ({
    search = "",
    status = "",
    verification = "",
    role = "",
    page = 1,
    limit = 10,
  } = {}) => {
    const response =
      await axios.get(
        `${API_URL}/api/customers/admin`,
        {
          ...getConfig(),
          params: {
            search,
            status,
            verification,
            role,
            page,
            limit,
          },
        }
      );

    return response.data;
  };

/* =========================================================
   GET CUSTOMER DETAILS
========================================================= */

export const getCustomerById =
  async (id) => {
    const response =
      await axios.get(
        `${API_URL}/api/customers/admin/${id}`,
        getConfig()
      );

    return response.data;
  };

/* =========================================================
   UPDATE CUSTOMER STATUS
========================================================= */

export const updateCustomerStatus =
  async (
    id,
    isActive
  ) => {
    const response =
      await axios.patch(
        `${API_URL}/api/customers/admin/${id}/status`,
        {
          isActive,
        },
        getConfig()
      );

    return response.data;
  };

/* =========================================================
   UPDATE CUSTOMER VERIFICATION
========================================================= */

export const updateCustomerVerification =
  async (
    id,
    isVerified
  ) => {
    const response =
      await axios.patch(
        `${API_URL}/api/customers/admin/${id}/verification`,
        {
          isVerified,
        },
        getConfig()
      );

    return response.data;
  };