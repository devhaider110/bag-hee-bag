import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const getToken = () => {
  return (
    localStorage.getItem("bhb_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem(
      "accessToken"
    ) ||
    ""
  );
};

const authConfig = () => {
  const token = getToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/*
|--------------------------------------------------------------------------
| PUBLIC SETTINGS
|--------------------------------------------------------------------------
*/

export const getPublicSettings =
  async () => {
    const response =
      await axios.get(
        `${API_URL}/settings/public`
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| ADMIN SETTINGS
|--------------------------------------------------------------------------
*/

export const getAdminSettings =
  async () => {
    const response =
      await axios.get(
        `${API_URL}/settings/admin`,
        authConfig()
      );

    return response.data;
  };

export const updateAdminSettings =
  async (payload) => {
    const response =
      await axios.put(
        `${API_URL}/settings/admin`,
        payload,
        authConfig()
      );

    return response.data;
  };