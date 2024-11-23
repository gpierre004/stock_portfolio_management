import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface Holding {
  ticker: string;
  total_quantity: number;
  total_value: number;
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
          ? `http://localhost:3000/api/transactions/portfolio/summary?accountId=${accountId}`
          : 'http://localhost:3000/api/transactions/portfolio/summary';
        const { data } = await axios.get<Holding[]>(url);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to fetch portfolio summary');
        }
        throw error;
      }
    },
    initialData: [], // Ensure we always have an array
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Portfolio Summary</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Portfolio Summary</h2>
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
        <h2 className="text-lg font-medium text-gray-900 mb-4">Portfolio Summary</h2>
        <div className="text-gray-500 text-center">
          No holdings found. Add some transactions to see your portfolio summary.
        </div>
      </div>
    );
  }

  const totalValue = safeHoldings.reduce((sum, holding) => {
    const value = typeof holding.total_value === 'number' ? holding.total_value : 0;
    return sum + value;
  }, 0);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Portfolio Summary</h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-500">Total Portfolio Value</p>
        <p className="text-2xl font-semibold text-gray-900">
          ${totalValue.toFixed(2)}
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safeHoldings}
              dataKey="total_value"
              nameKey="ticker"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ ticker }) => ticker || 'Unknown'}
            >
              {safeHoldings.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Holdings</h3>
        <div className="space-y-2">
          {safeHoldings.map((holding) => (
            <div key={holding.ticker || 'unknown'} className="flex justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {holding.ticker || 'Unknown'}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  ({typeof holding.total_quantity === 'number' ? holding.total_quantity.toFixed(5) : '0.00000'} shares)
                </span>
              </div>
              <span className="text-sm text-gray-900">
                ${typeof holding.total_value === 'number' ? holding.total_value.toFixed(2) : '0.00'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
