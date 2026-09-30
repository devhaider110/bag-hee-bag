import axios from "axios";

const API_URL =
  "http://localhost:5000/api/cart";

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

// ==========================================
// GET CART
// ==========================================
export const getCart = async (token) => {
  const response = await axios.get(
    API_URL,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ==========================================
// ADD TO CART
// ==========================================
export const addToCart = async (
  token,
  productId,
  quantity = 1,
  variantId = null
) => {
  const response = await axios.post(
    API_URL,
    {
      productId,
      quantity,
      variantId,
    },
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ==========================================
// UPDATE QUANTITY
// ==========================================
export const updateCartItem = async (
  token,
  itemId,
  quantity
) => {
  const response = await axios.patch(
    `${API_URL}/item/${itemId}`,
    {
      quantity,
    },
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ==========================================
// REMOVE ITEM
// ==========================================
export const removeFromCart = async (
  token,
  itemId
) => {
  const response = await axios.delete(
    `${API_URL}/item/${itemId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ==========================================
// CLEAR CART
// ==========================================
export const clearCart = async (token) => {
  const response = await axios.delete(
    API_URL,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};