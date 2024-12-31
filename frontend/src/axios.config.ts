// axios.config.ts

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // Adjust as necessary
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (optional)
axiosInstance.interceptors.request.use(
  (config) => {
    // Modify request config if needed (e.g., add auth tokens)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here (e.g., logging, notifications)
    return Promise.reject(error);
  }
);

export default axiosInstance;
