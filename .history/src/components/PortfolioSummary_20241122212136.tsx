import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';

interface Holding {
  ticker: string;
  total_quantity: number;
  total_value: number;
  profit_loss?: number;
  percent_change?: number;
}

interface PortfolioSummaryProps {
  accountId: number | null;
}

export default function PortfolioSummary({ accountId }: PortfolioSummaryProps) {
  const { data: holdings = [], error, isError, isLoading } = useQuery<Holding[]>({
    queryKey: ['portfolio', accountId],
    queryFn: async () => {
      try {
        const url = accountId 
          ? `${ENDPOINTS.PORTFOLIO_SUMMARY}?accountId=${accountId}`
          : ENDPOINTS.PORTFOLIO_SUMMARY;
        const { data } = await axios.get<Holding[]>(url);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to fetch portfolio summary');
        }
        throw error;
      }
    },
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600">
          {error instanceof Error ? error.message : 'An error occurred while fetching portfolio data'}
        </div>
      </div>
    );
  }

  const safeHoldings = Array.isArray(holdings) ? holdings : [];
  
  if (!safeHoldings.length) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-gray-500 text-center">
          No holdings found. Add some transactions to see your portfolio summary.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {safeHoldings.map((holding) => (
        <div key={holding.ticker} className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{holding.ticker}</h3>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              (holding.percent_change || 0) >= 0 
                ? 'text-green-800 bg-green-100' 
                : 'text-red-800 bg-red-100'
            }`}>
              {(holding.percent_change || 0).toFixed(2)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Invested</p>
              <p className="text-lg font-semibold text-gray-900">
                ${typeof holding.total_value === 'number' ? holding.total_value.toFixed(2) : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Value</p>
              <p className="text-lg font-semibold text-gray-900">
                ${typeof holding.total_value === 'number' ? holding.total_value.toFixed(2) : '0.00'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Quantity</p>
            <p className="text-lg font-semibold text-gray-900">
              {typeof holding.total_quantity === 'number' ? holding.total_quantity.toFixed(5) : '0.00000'}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Profit/Loss</p>
            <p className={`text-lg font-semibold ${
              (holding.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${typeof holding.profit_loss === 'number' ? Math.abs(holding.profit_loss).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
