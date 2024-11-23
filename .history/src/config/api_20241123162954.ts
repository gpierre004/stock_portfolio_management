import axios from 'axios';

export const API_BASE_URL = 'http://localhost:3001/api';

export const ENDPOINTS = {
  TRANSACTIONS: `${API_BASE_URL}/transactions`,
  ACCOUNTS: `${API_BASE_URL}/accounts`,
  PORTFOLIO_SUMMARY: `${API_BASE_URL}/transactions/portfolio/summary`,
  WATCHLIST: `${API_BASE_URL}/watchlist`,
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add the JWT token if available
    ...(localStorage.getItem('token') && {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    })
  }
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration - redirect to login or refresh token
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
