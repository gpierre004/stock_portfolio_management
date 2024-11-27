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
  },
  TECHNICAL_ANALYSIS: {
    SIGNALS: `${API_BASE_URL}/analysis/signals`,
    BREAKOUTS: `${API_BASE_URL}/analysis/breakouts`,
    BREAKOUTS_SUMMARY: `${API_BASE_URL}/analysis/breakouts/summary`,
    STOCK_ANALYSIS: `${API_BASE_URL}/analysis/stock`,
    INDICATORS: {
      RSI: `${API_BASE_URL}/analysis/indicators/rsi`,
      MACD: `${API_BASE_URL}/analysis/indicators/macd`,
      MA: `${API_BASE_URL}/analysis/indicators/ma`,
      VOLUME: `${API_BASE_URL}/analysis/indicators/volume`
    }
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear token and redirect to login on auth errors
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
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
