import axios from "axios";

const API_URL =
  "http://localhost:5000/api/auth";

const USER_API_URL =
  "http://localhost:5000/api/user";

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const registerUser = async (
  userData
) => {
  const response =
    await axios.post(
      `${API_URL}/register`,
      userData
    );

  return response.data;
};

export const loginUser = async (
  credentials
) => {
  const response =
    await axios.post(
      `${API_URL}/login`,
      credentials
    );

  return response.data;
};

export const getCurrentUser = async (
  token
) => {
  const response =
    await axios.get(
      `${USER_API_URL}/me`,
      {
        headers:
          getAuthHeaders(token),
      }
    );

  return response.data;
};

export const updateUserProfile =
  async (
    token,
    profileData
  ) => {
    const response =
      await axios.put(
        `${USER_API_URL}/profile`,
        profileData,
        {
          headers:
            getAuthHeaders(token),
        }
      );

    return response.data;
  };

export const changeUserPassword =
  async (
    token,
    passwordData
  ) => {
    const response =
      await axios.put(
        `${USER_API_URL}/change-password`,
        passwordData,
        {
          headers:
            getAuthHeaders(token),
        }
      );

    return response.data;
  };