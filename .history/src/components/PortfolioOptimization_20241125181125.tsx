import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import type { PortfolioSummary } from '../types/transaction';

interface OptimizationSuggestion {
  ticker: string;
  currentAllocation: number;
  targetAllocation: number;
  suggestedAction: 'BUY' | 'SELL';
  quantity: number;
}

interface PortfolioOptimizationProps {
  accountId: number | null;
}

export default function PortfolioOptimization({ accountId }: PortfolioOptimizationProps) {
  const [targetAllocation, setTargetAllocation] = useState<Record<string, number>>({});
  const [scenarioAmount, setScenarioAmount] = useState<number>(0);

  const { data: holdings = [], isLoading } = useQuery<PortfolioSummary[]>({
    queryKey: ['portfolio', accountId],
    queryFn: async () => {
      const url = accountId 
        ? `${ENDPOINTS.PORTFOLIO_SUMMARY}?accountId=${accountId}`
        : ENDPOINTS.PORTFOLIO_SUMMARY;
      const { data } = await axios.get<PortfolioSummary[]>(url);
      return Array.isArray(data) ? data : [];
    },
    initialData: [],
  });

  const calculateRebalancingSuggestions = (): OptimizationSuggestion[] => {
    const totalValue = holdings.reduce((sum, holding) => sum + holding.current_value, 0);
    
    return holdings.map(holding => {
      const currentAllocation = (holding.current_value / totalValue) * 100;
      const target = targetAllocation[holding.ticker] || currentAllocation;
      const difference = target - currentAllocation;
      const suggestedAction = difference > 0 ? 'BUY' : 'SELL';
      const quantity = Math.abs((difference / 100) * totalValue / (holding.current_value / holding.total_quantity));
      
      return {
        ticker: holding.ticker,
        currentAllocation,
        targetAllocation: target,
        suggestedAction,
        quantity: Math.round(quantity * 100) / 100,
      };
    });
  };

  const calculateWhatIfScenario = () => {
    return holdings.map(holding => ({
      ticker: holding.ticker,
      currentValue: holding.current_value,
      projectedValue: holding.current_value * (1 + scenarioAmount / 100),
      difference: holding.current_value * (scenarioAmount / 100)
    }));
  };

  if (isLoading) {
    return <div className="animate-pulse bg-white shadow rounded-lg p-6">Loading...</div>;
  }

  const suggestions = calculateRebalancingSuggestions();
  const whatIfScenario = calculateWhatIfScenario();

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
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Suggestions:</h3>
          {suggestions.map(suggestion => (
            <div key={suggestion.ticker} className="text-sm text-gray-600 mb-2">
              {suggestion.ticker}: {suggestion.suggestedAction} {suggestion.quantity} shares
              (Current: {suggestion.currentAllocation.toFixed(1)}% → Target: {suggestion.targetAllocation.toFixed(1)}%)
            </div>
          ))}
        </div>
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
          <span className="ml-2">% Market Movement</span>
        </div>

        <div className="space-y-2">
          {whatIfScenario.map(scenario => (
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
