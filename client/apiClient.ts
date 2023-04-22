import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:8888/.netlify/functions/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
