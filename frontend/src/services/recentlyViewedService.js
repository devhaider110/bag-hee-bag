import axios from "axios";

const API_URL = "http://localhost:5000/api/recently-viewed";

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

// Get recently viewed products
export const getRecentlyViewed = async (token) => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(token),
  });

  return response.data;
};

// Add product to recently viewed
export const addRecentlyViewed = async (token, productId) => {
  const response = await axios.post(
    API_URL,
    { productId },
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// Clear recently viewed
export const clearRecentlyViewed = async (token) => {
  const response = await axios.delete(API_URL, {
    headers: getAuthHeaders(token),
  });

  return response.data;
};