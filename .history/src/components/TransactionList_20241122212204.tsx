import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { ENDPOINTS } from '../config/api';

interface Transaction {
  purchase_id: number;
  ticker: string;
  purchase_date: string;
  quantity: number;
  type: string;
  purchase_price: number;
  description?: string;
  comment?: string;
  account_id?: number;
}

interface TransactionListProps {
  accountId: number | null;
}

export default function TransactionList({ accountId }: TransactionListProps) {
  const { data: transactions = [], error, isError, isLoading } = useQuery({
    queryKey: ['transactions', accountId],
    queryFn: async () => {
      try {
        const url = accountId 
          ? `${ENDPOINTS.TRANSACTIONS}?accountId=${accountId}`
          : ENDPOINTS.TRANSACTIONS;
        const { data } = await axios.get<Transaction[]>(url);
        return Array.isArray(data) ? data.slice(0, 10) : []; // Only get last 10 transactions
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
        }
        throw error;
      }
    },
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600">
          {error instanceof Error ? error.message : 'An error occurred while fetching transactions'}
        </div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-gray-500 text-center">
          No transactions found. Add a transaction to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h2>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div 
            key={transaction.purchase_id} 
            className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-medium text-gray-900">
                    {transaction.ticker}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    transaction.type.toLowerCase() === 'buy' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {format(parseISO(transaction.purchase_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900">
                  ${(transaction.quantity * transaction.purchase_price).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {transaction.quantity.toFixed(5)} shares @ ${transaction.purchase_price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
