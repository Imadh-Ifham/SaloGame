// src/api/axiosInstance.ts
import axios from "axios";
import { getAuth } from "firebase/auth";

// Dynamically set the baseURL using the VITE_API_PORT environment variable
const baseURL = `http://localhost:${import.meta.env.VITE_API_PORT}/api`;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the Authorization header
axiosInstance.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
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
