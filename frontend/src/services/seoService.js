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
| PUBLIC SEO
|--------------------------------------------------------------------------
*/

export const getSeoByPath =
  async (path) => {
    const response =
      await axios.get(
        `${API_URL}/seo/public`,
        {
          params: {
            path,
          },
        }
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| ADMIN SEO LIST
|--------------------------------------------------------------------------
*/

export const getSeoRecords =
  async ({
    entityType = "",
    search = "",
  } = {}) => {
    const response =
      await axios.get(
        `${API_URL}/seo/admin`,
        {
          params: {
            entityType,
            search,
          },

          ...authConfig(),
        }
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| ADMIN SEO SAVE
|--------------------------------------------------------------------------
*/

export const saveSeo =
  async (payload) => {
    const response =
      await axios.post(
        `${API_URL}/seo/admin`,
        payload,
        authConfig()
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| ADMIN SEO DELETE
|--------------------------------------------------------------------------
*/

export const deleteSeo =
  async (id) => {
    const response =
      await axios.delete(
        `${API_URL}/seo/admin/${id}`,
        authConfig()
      );

    return response.data;
  };