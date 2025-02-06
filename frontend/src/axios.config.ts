import axios from "axios";

// ✅ Ensure baseURL always has a valid port
const baseURL = `http://localhost:${import.meta.env.VITE_API_PORT || 4000}/api`;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor with improved error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error("API endpoint not found:", error.config.url);
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth"; // Consider using an event-based approach
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
