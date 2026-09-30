import axios from "axios";

const API_URL = "http://localhost:5000/api/addresses";

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

// ==============================
// GET ALL ADDRESSES
// ==============================
export const getAddresses = async (token) => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(token),
  });

  return response.data;
};

// ==============================
// GET SINGLE ADDRESS
// ==============================
export const getAddressById = async (token, addressId) => {
  const response = await axios.get(`${API_URL}/${addressId}`, {
    headers: getAuthHeaders(token),
  });

  return response.data;
};

// ==============================
// ADD ADDRESS
// ==============================
export const addAddress = async (token, addressData) => {
  const response = await axios.post(API_URL, addressData, {
    headers: getAuthHeaders(token),
  });

  return response.data;
};

// ==============================
// UPDATE ADDRESS
// ==============================
export const updateAddress = async (
  token,
  addressId,
  addressData
) => {
  const response = await axios.put(
    `${API_URL}/${addressId}`,
    addressData,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ==============================
// SET DEFAULT ADDRESS
// ==============================
export const setDefaultAddress = async (
  token,
  addressId
) => {
  const response = await axios.patch(
    `${API_URL}/${addressId}/default`,
    {},
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};

// ==============================
// DELETE ADDRESS
// ==============================
export const deleteAddress = async (token, addressId) => {
  const response = await axios.delete(
    `${API_URL}/${addressId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  return response.data;
};