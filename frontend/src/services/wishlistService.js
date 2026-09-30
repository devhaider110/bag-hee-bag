import axios from "axios";

const API_URL = "http://localhost:5000/api/wishlist";

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const getWishlist = async (token) => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(token),
  });

  return response.data;
};

export const addToWishlist = async (
  token,
  productId
) => {
  const response = await axios.post(
    API_URL,
    {
      productId,
    },
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

export const removeFromWishlist = async (
  token,
  productId
) => {
  const response = await axios.delete(
    `${API_URL}/${productId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

export const checkWishlist = async (
  token,
  productId
) => {
  const response = await axios.get(
    `${API_URL}/check/${productId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};