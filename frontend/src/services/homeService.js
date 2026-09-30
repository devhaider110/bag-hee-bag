import axios from "axios";

const API_URL = "http://localhost:5000/api/home";

export const getHomeData = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};