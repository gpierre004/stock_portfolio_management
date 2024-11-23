import axios from 'axios';

export const API_BASE_URL = 'http://localhost:3001/api';

export const ENDPOINTS = {
  TRANSACTIONS: `${API_BASE_URL}/transactions`,
  ACCOUNTS: `${API_BASE_URL}/accounts`,
  PORTFOLIO_SUMMARY: `${API_BASE_URL}/transactions/portfolio/summary`,
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
