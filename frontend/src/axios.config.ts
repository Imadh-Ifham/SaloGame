import axios from "axios";

// Dynamically set the baseURL using the VITE_API_PORT environment variable
const baseURL = `http://localhost:${import.meta.env.VITE_API_PORT}/api`;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (optional)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
