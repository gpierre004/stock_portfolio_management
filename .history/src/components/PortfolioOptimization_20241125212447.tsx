import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api, { ENDPOINTS } from '../config/api';
import { authService } from '../services/authService';
import type { PortfolioSummary } from '../types/transaction';
import axios from 'axios';

interface OptimizationSuggestion {
  ticker: string;
  currentAllocation: number;
  targetAllocation: number;
  suggestedAction: 'BUY' | 'SELL';
  quantity: number;
}

interface ScenarioAnalysis {
  ticker: string;
  currentValue: number;
  projectedValue: number;
  difference: number;
}

interface PortfolioOptimizationProps {
  accountId: number | null;
}

export default function PortfolioOptimization({ accountId }: PortfolioOptimizationProps) {
  const [targetAllocation, setTargetAllocation] = useState<Record<string, number>>({});
  const [scenarioAmount, setScenarioAmount] = useState<number>(0);
  const navigate = useNavigate();

  // Check authentication before making requests
  const checkAuth = () => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return false;
    }
    return true;
  };

  // Fetch portfolio data
  const { data: holdings = [], isLoading, error } = useQuery<PortfolioSummary[], Error>({
    queryKey: ['portfolio-optimization', accountId],
    queryFn: async () => {
      if (!checkAuth()) return [];
      
      const url = accountId 
        ? `${ENDPOINTS.PORTFOLIO_OPTIMIZATION.BASE}?accountId=${accountId}`
        : ENDPOINTS.PORTFOLIO_OPTIMIZATION.BASE;
      try {
        const { data } = await api.get(url);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate('/login');
        }
        throw err;
      }
    },
    initialData: [],
  });

  // Rebalancing mutation
  const rebalanceMutation = useMutation({
    mutationFn: async () => {
      if (!checkAuth()) return null;
      
      try {
        const { data } = await api.post(ENDPOINTS.PORTFOLIO_OPTIMIZATION.REBALANCE, {
          targetAllocations: targetAllocation,
          accountId
        });
        return data;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate('/login');
        }
        throw err;
      }
    }
  });

  // Scenario analysis mutation
  const scenarioMutation = useMutation({
    mutationFn: async () => {
      if (!checkAuth()) return null;
      
      try {
        const { data } = await api.post(ENDPOINTS.PORTFOLIO_OPTIMIZATION.SCENARIO, {
          percentageChange: scenarioAmount,
          accountId
        });
        return data;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate('/login');
        }
        throw err;
      }
    }
  });

  if (isLoading) {
    return <div className="animate-pulse bg-white shadow rounded-lg p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        An error occurred while loading portfolio data: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rebalancing Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Portfolio Rebalancing</h2>
        <div className="space-y-4">
          {holdings.map(holding => (
            <div key={holding.ticker} className="flex items-center space-x-4">
              <span className="w-20">{holding.ticker}</span>
              <input
                type="number"
                min="0"
                max="100"
                className="border rounded px-2 py-1 w-24"
                placeholder="Target %"
                value={targetAllocation[holding.ticker] || ''}
                onChange={(e) => setTargetAllocation(prev => ({
                  ...prev,
                  [holding.ticker]: Number(e.target.value)
                }))}
              />
            </div>
          ))}
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => rebalanceMutation.mutate()}
            disabled={rebalanceMutation.isPending}
          >
            Calculate Rebalancing
          </button>
        </div>

        {rebalanceMutation.data && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Suggestions:</h3>
            {rebalanceMutation.data.map((suggestion: OptimizationSuggestion) => (
              <div key={suggestion.ticker} className="text-sm text-gray-600 mb-2">
                {suggestion.ticker}: {suggestion.suggestedAction} {suggestion.quantity} shares
                (Current: {suggestion.currentAllocation.toFixed(1)}% → Target: {suggestion.targetAllocation.toFixed(1)}%)
              </div>
            ))}
          </div>
        )}

        {rebalanceMutation.error instanceof Error && (
          <div className="mt-4 text-red-600">
            Failed to calculate rebalancing suggestions: {rebalanceMutation.error.message}
          </div>
        )}
      </div>

      {/* What-If Scenario Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">What-If Scenario Analysis</h2>
        <div className="mb-4">
          <input
            type="number"
            className="border rounded px-2 py-1 w-32"
            placeholder="% Change"
            value={scenarioAmount}
            onChange={(e) => setScenarioAmount(Number(e.target.value))}
          />
          <button
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => scenarioMutation.mutate()}
            disabled={scenarioMutation.isPending}
          >
            Calculate Scenario
          </button>
        </div>

        {scenarioMutation.data && (
          <div className="space-y-2">
            {scenarioMutation.data.map((scenario: ScenarioAnalysis) => (
              <div key={scenario.ticker} className="text-sm">
                <span className="font-medium">{scenario.ticker}:</span>
                <span className="ml-2">${scenario.currentValue.toFixed(2)} → </span>
                <span className={scenario.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ${scenario.projectedValue.toFixed(2)}
                </span>
                <span className="ml-2 text-gray-500">
                  ({scenario.difference >= 0 ? '+' : ''}{scenario.difference.toFixed(2)})
                </span>
              </div>
            ))}
          </div>
        )}

        {scenarioMutation.error instanceof Error && (
          <div className="mt-4 text-red-600">
            Failed to calculate scenario analysis: {scenarioMutation.error.message}
          </div>
        )}
      </div>

      {/* Dividend Reinvestment Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Dividend Reinvestment Tracking</h2>
        <p className="text-gray-600">
          Coming soon: Track and analyze your dividend reinvestment strategy
        </p>
      </div>
    </div>
  );
}
