import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import type { PortfolioSummary as PortfolioSummaryType } from '../types/transaction';

interface PortfolioSummaryProps {
  accountId: number | null;
}

export default function PortfolioSummary({ accountId }: PortfolioSummaryProps) {
  const { data: holdings = [], error, isError, isLoading } = useQuery<PortfolioSummaryType[]>({
    queryKey: ['portfolio', accountId],
    queryFn: async () => {
      try {
        const url = accountId 
          ? `${ENDPOINTS.PORTFOLIO_SUMMARY}?accountId=${accountId}`
          : ENDPOINTS.PORTFOLIO_SUMMARY;
        const { data } = await axios.get<PortfolioSummaryType[]>(url);
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
      <div className="flex-1 bg-white shadow rounded-lg p-6">
        <div className="text-red-600">
          {error instanceof Error ? error.message : 'An error occurred while fetching portfolio data'}
        </div>
      </div>
    );
  }

  const safeHoldings = Array.isArray(holdings) ? holdings : [];
  
  if (!safeHoldings.length) {
    return (
      <div className="flex-1 bg-white shadow rounded-lg p-6">
        <div className="text-gray-500 text-center">
          No holdings found. Add some transactions to see your portfolio summary.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {safeHoldings.map((holding) => (
        <div key={holding.ticker} className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-gray-900">{holding.ticker}</h3>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              (holding.percent_change || 0) >= 0 
                ? 'text-green-800 bg-green-100' 
                : 'text-red-800 bg-red-100'
            }`}>
              {(holding.percent_change || 0).toFixed(2)}%
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Invested</p>
                <p className="text-base">
                  <span className="text-gray-400 text-sm">$</span>
                  <span className="font-semibold text-gray-900">{(holding.total_invested || 0).toFixed(2)}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Value</p>
                <p className="text-base">
                  <span className="text-gray-400 text-sm">$</span>
                  <span className="font-semibold text-gray-900">{(holding.current_value || 0).toFixed(2)}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="text-base font-semibold text-gray-900">
                {(holding.total_quantity || 0).toFixed(1)}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Profit/Loss</p>
              <p className={`text-base font-semibold flex items-center ${
                (holding.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(holding.profit_loss || 0) >= 0 ? (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                <span className="text-gray-400 text-sm">$</span>
                {Math.abs(holding.profit_loss || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
