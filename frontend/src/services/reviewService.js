import axios from "axios";

const API_URL = "http://localhost:5000/api/reviews";

// =====================================================
// AUTH CONFIG
// =====================================================

const getAuthConfig = () => {
  const token = localStorage.getItem("bhb_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// =====================================================
// PRODUCT REVIEWS
// =====================================================

export const getProductReviews = async (
  productId,
  params = {}
) => {
  const response = await axios.get(
    `${API_URL}/product/${productId}`,
    { params }
  );

  return response.data;
};

// =====================================================
// MY REVIEW FOR PRODUCT
// =====================================================

export const getMyProductReview = async (productId) => {
  const response = await axios.get(
    `${API_URL}/product/${productId}/my`,
    getAuthConfig()
  );

  return response.data;
};

// =====================================================
// CREATE REVIEW
// =====================================================

export const createReview = async (data) => {
  const response = await axios.post(
    API_URL,
    data,
    getAuthConfig()
  );

  return response.data;
};

// =====================================================
// MY REVIEWS
// =====================================================

export const getMyReviews = async () => {
  const response = await axios.get(
    `${API_URL}/my`,
    getAuthConfig()
  );

  return response.data;
};

// =====================================================
// UPDATE REVIEW
// =====================================================

export const updateReview = async (id, data) => {
  const response = await axios.patch(
    `${API_URL}/${id}`,
    data,
    getAuthConfig()
  );

  return response.data;
};

// =====================================================
// DELETE REVIEW
// =====================================================

export const deleteReview = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getAuthConfig()
  );

  return response.data;
};

// =====================================================
// ADMIN - ALL REVIEWS
// =====================================================

export const getAllReviews = async (params = {}) => {
  const response = await axios.get(`${API_URL}/admin`, {
    ...getAuthConfig(),
    params,
  });

  return response.data;
};

// =====================================================
// ADMIN - UPDATE STATUS
// =====================================================

export const updateReviewStatus = async (id, data) => {
  const response = await axios.patch(
    `${API_URL}/admin/${id}/status`,
    data,
    getAuthConfig()
  );

  return response.data;
};

// =====================================================
// ADMIN - DELETE
// =====================================================

export const adminDeleteReview = async (id) => {
  const response = await axios.delete(
    `${API_URL}/admin/${id}`,
    getAuthConfig()
  );

  return response.data;
};