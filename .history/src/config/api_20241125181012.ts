import axios from 'axios';

export const API_BASE_URL = 'http://localhost:3001/api';

export const ENDPOINTS = {
  TRANSACTIONS: `${API_BASE_URL}/transactions`,
  ACCOUNTS: `${API_BASE_URL}/accounts`,
  PORTFOLIO_SUMMARY: `${API_BASE_URL}/transactions/portfolio/summary`,
  WATCHLIST: `${API_BASE_URL}/watchlist`,
  AUTH: `${API_BASE_URL}/auth`,
  PORTFOLIO_OPTIMIZATION: {
    BASE: `${API_BASE_URL}/portfolio/optimization`,
    REBALANCE: `${API_BASE_URL}/portfolio/optimization/rebalance`,
    SCENARIO: `${API_BASE_URL}/portfolio/optimization/scenario`,
    DIVIDENDS: `${API_BASE_URL}/portfolio/optimization/dividends`
  }
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
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request:', token); // Debugging line
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
