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
  const { data: holdings = [] } = useQuery<Holding[]>({
    queryKey: ['portfolio', accountId],
    queryFn: async () => {
      const url = accountId 
        ? `http://localhost:3000/api/transactions/portfolio/summary?accountId=${accountId}`
        : 'http://localhost:3000/api/transactions/portfolio/summary';
      const { data } = await axios.get(url);
      return data;
    },
  });

  const totalValue = holdings.reduce((sum, holding) => sum + holding.total_value, 0);

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
              data={holdings}
              dataKey="total_value"
              nameKey="ticker"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ ticker }) => ticker}
            >
              {holdings.map((_, index) => (
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
          {holdings.map((holding) => (
            <div key={holding.ticker} className="flex justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900">{holding.ticker}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({holding.total_quantity.toFixed(5)} shares)
                </span>
              </div>
              <span className="text-sm text-gray-900">
                ${holding.total_value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}