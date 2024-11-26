import React, { useState } from 'react';
import TradingSignals from '../components/TradingSignals';
import AccountSelector from '../components/AccountSelector';
import ErrorBoundary from '../components/ErrorBoundary';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import type { PortfolioSummary } from '../types/transaction';

interface AnalysisProps {
  selectedAccountId: number | null;
  setSelectedAccountId: (id: number | null) => void;
}

const Analysis: React.FC<AnalysisProps> = ({ selectedAccountId, setSelectedAccountId }) => {
  const [selectedTicker, setSelectedTicker] = useState<string>('');

  const { data: holdings = [] } = useQuery<PortfolioSummary[]>({
    queryKey: ['portfolio', selectedAccountId],
    queryFn: async () => {
      try {
        const url = selectedAccountId 
          ? `${ENDPOINTS.PORTFOLIO_SUMMARY}?accountId=${selectedAccountId}`
          : ENDPOINTS.PORTFOLIO_SUMMARY;
        const { data } = await axios.get<PortfolioSummary[]>(url);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        return [];
      }
    },
    initialData: [],
  });

  return (
    <>
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold text-gray-900">Technical Analysis</h1>
            <div className="flex items-center space-x-4">
              <AccountSelector
                selectedAccountId={selectedAccountId}
                onAccountChange={setSelectedAccountId}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="p-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Stock List */}
          <div className="col-span-3">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Holdings</h2>
              <div className="space-y-2">
                {holdings.map((holding) => (
                  <button
                    key={holding.ticker}
                    onClick={() => setSelectedTicker(holding.ticker)}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      selectedTicker === holding.ticker
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{holding.ticker}</span>
                    <span className={`ml-2 text-sm ${
                      (holding.percent_change || 0) >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {(holding.percent_change || 0).toFixed(2)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trading Signals */}
          <div className="col-span-9">
            {selectedTicker ? (
              <ErrorBoundary>
                <TradingSignals ticker={selectedTicker} />
              </ErrorBoundary>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500 text-center">
                  Select a stock from your holdings to view technical analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Analysis;
