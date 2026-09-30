// import axios from "axios";

// const API_URL =
//   "http://localhost:5000/api/coupons";

// const getAuthHeaders = (token) => ({
//   Authorization: `Bearer ${token}`,
// });

// // ==============================
// // CUSTOMER
// // ==============================

// export const validateCoupon = async (
//   token,
//   code,
//   cartValue
// ) => {
//   const response = await axios.post(
//     `${API_URL}/validate`,
//     {
//       code,
//       cartValue,
//     },
//     {
//       headers: getAuthHeaders(token),
//     }
//   );

//   return response.data;
// };

// // ==============================
// // ADMIN
// // ==============================

// export const getCoupons = async (token) => {
//   const response = await axios.get(API_URL, {
//     headers: getAuthHeaders(token),
//   });

//   return response.data;
// };

// export const createCoupon = async (
//   token,
//   couponData
// ) => {
//   const response = await axios.post(
//     API_URL,
//     couponData,
//     {
//       headers: getAuthHeaders(token),
//     }
//   );

//   return response.data;
// };

// export const updateCoupon = async (
//   token,
//   couponId,
//   couponData
// ) => {
//   const response = await axios.put(
//     `${API_URL}/${couponId}`,
//     couponData,
//     {
//       headers: getAuthHeaders(token),
//     }
//   );

//   return response.data;
// };

// export const toggleCoupon = async (
//   token,
//   couponId
// ) => {
//   const response = await axios.patch(
//     `${API_URL}/${couponId}/toggle`,
//     {},
//     {
//       headers: getAuthHeaders(token),
//     }
//   );

//   return response.data;
// };

// export const deleteCoupon = async (
//   token,
//   couponId
// ) => {
//   const response = await axios.delete(
//     `${API_URL}/${couponId}`,
//     {
//       headers: getAuthHeaders(token),
//     }
//   );

//   return response.data;
// };

import axios from "axios";

const API_URL =
  "http://localhost:5000/api/coupons";

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

// ==============================
// PUBLIC - ACTIVE OFFERS
// ==============================
export const getActiveOffers = async () => {
  const response = await axios.get(
    `${API_URL}/active`
  );

  return response.data;
};

// ==============================
// CUSTOMER - VALIDATE COUPON
// ==============================
export const validateCoupon = async (
  token,
  code,
  cartValue
) => {
  const response = await axios.post(
    `${API_URL}/validate`,
    {
      code,
      cartValue,
    },
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ==============================
// ADMIN - GET COUPONS
// ==============================
export const getCoupons = async (token) => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(token),
  });

  return response.data;
};

// ==============================
// ADMIN - CREATE COUPON
// ==============================
export const createCoupon = async (
  token,
  couponData
) => {
  const response = await axios.post(
    API_URL,
    couponData,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ==============================
// ADMIN - UPDATE COUPON
// ==============================
export const updateCoupon = async (
  token,
  couponId,
  couponData
) => {
  const response = await axios.put(
    `${API_URL}/${couponId}`,
    couponData,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ==============================
// ADMIN - TOGGLE COUPON
// ==============================
export const toggleCoupon = async (
  token,
  couponId
) => {
  const response = await axios.patch(
    `${API_URL}/${couponId}/toggle`,
    {},
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ==============================
// ADMIN - DELETE COUPON
// ==============================
export const deleteCoupon = async (
  token,
  couponId
) => {
  const response = await axios.delete(
    `${API_URL}/${couponId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};