const BASE_URL = "http://localhost:5000";

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
  GAMES: {
    GET_GAMES: `${BASE_URL}/games/`,
  },
  PACKAGES: {
    GET_PACKAGES: `${BASE_URL}/api/packages/`,
    UPDATE_PACKAGE: (id: string) => `${BASE_URL}/api/packages/${id}`, // New endpoint for updating packages
  },
  
};

export default API_ENDPOINTS;
