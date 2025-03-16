const BASE_URL = `http://localhost:${import.meta.env.VITE_API_PORT || 4000}`;
export const API_ENDPOINTS = {
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
  BOOKINGS: {
    CREATE_BOOKING: `${BASE_URL}/api/bookings`,
    GET_BOOKINGS: `${BASE_URL}/api/bookings`, // New endpoint for fetching all bookings
    UPDATE_BOOKING: (id: string) => `${BASE_URL}/api/bookings/${id}`, // New endpoint for updating bookings
    GET_BOOKINGS_BY_USER: (userId: string) =>
      `${BASE_URL}/api/bookings/user/${userId}`,
  },
  SUBSCRIPTIONS: {
    CREATE: `${BASE_URL}/api/subscriptions`,
    GET_USER_SUBSCRIPTIONS: `${BASE_URL}/api/subscriptions/user`,
  },
};

export default API_ENDPOINTS;
