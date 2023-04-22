import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:8888/.netlify/functions/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const githubClient = axios.create({
  baseURL: "http://api.github.com/users/",
  headers: {
    Accept: "application/vnd.github+json",
  },
});
