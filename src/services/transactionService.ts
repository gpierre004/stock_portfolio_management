import api from '../config/api';
import { Transaction, PortfolioSummary } from '../../server/types/transaction';

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data } = await api.get('/transactions');
  return data;
};

export const createTransaction = async (transaction: Transaction): Promise<number> => {
  const { data } = await api.post('/transactions', transaction);
  return data.id;
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await api.delete(`/transactions/${id}`);
};

export const getPortfolioSummary = async (): Promise<PortfolioSummary[]> => {
  const { data } = await api.get('/transactions/portfolio/summary');
  return data;
};