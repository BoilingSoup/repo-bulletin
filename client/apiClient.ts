import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://repobullet.in/.netlify/functions/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const githubClient = axios.create({
  baseURL: "https://api.github.com/",
  headers: {
    Accept: "application/vnd.github+json",
  },
});
