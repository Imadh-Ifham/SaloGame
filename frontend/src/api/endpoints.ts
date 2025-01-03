const BASE_URL = "https://api.example.com";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
  },
  USERS: {
    GET_USERS: `${BASE_URL}/users`,
    GET_USER_BY_ID: (id: string) => `${BASE_URL}/users/${id}`,
  },
  ADMIN: {
    DASHBOARD: `${BASE_URL}/admin/dashboard`,
  },
};

export default API_ENDPOINTS;
