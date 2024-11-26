import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface TradingSignal {
  signal: 'BUY' | 'SELL' | 'NEUTRAL' | 'ALERT' | 'CAUTION';
  message: string;
}

interface Indicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    ma20: number;
    ma50: number;
    ma200: number;
  };
  volume: {
    current: number;
    average: number;
    status: string;
  };
}

interface SignalResponse {
  ticker: string;
  timestamp: string;
  indicators: Indicators;
  signals: {
    rsi: TradingSignal;
    macd: TradingSignal;
    movingAverages: TradingSignal;
    volume: TradingSignal;
  };
}

interface TradingSignalsProps {
  ticker: string;
}

const SignalIndicator: React.FC<{ signal: TradingSignal }> = ({ signal }) => {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'bg-green-100 text-green-800';
      case 'SELL':
        return 'bg-red-100 text-red-800';
      case 'ALERT':
        return 'bg-yellow-100 text-yellow-800';
      case 'CAUTION':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4" />;
      case 'SELL':
        return <TrendingDown className="w-4 h-4" />;
      case 'ALERT':
      case 'CAUTION':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSignalColor(signal.signal)}`}>
      {getSignalIcon(signal.signal)}
      <span className="ml-1">{signal.signal}</span>
    </div>
  );
};

const TradingSignals: React.FC<TradingSignalsProps> = ({ ticker }) => {
  const { data: signals, isLoading, error } = useQuery<SignalResponse>({
    queryKey: ['trading-signals', ticker],
    queryFn: async () => {
      const { data } = await axios.get(`${ENDPOINTS.TECHNICAL_ANALYSIS.SIGNALS}/${ticker}`);
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <div className="animate-pulse bg-white shadow rounded-lg p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading trading signals</p>
      </div>
    );
  }

  if (!signals) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Trading Signals - {ticker}</h3>
        <span className="text-sm text-gray-500">
          Updated: {new Date(signals.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="space-y-6">
        {/* Technical Indicators */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Technical Indicators</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-3">
              <span className="text-sm text-gray-500">RSI (14)</span>
              <div className="text-lg font-semibold">{signals.indicators.rsi.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <span className="text-sm text-gray-500">MACD</span>
              <div className="text-lg font-semibold">{signals.indicators.macd.value.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <span className="text-sm text-gray-500">MA (20)</span>
              <div className="text-lg font-semibold">${signals.indicators.movingAverages.ma20.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <span className="text-sm text-gray-500">Volume</span>
              <div className="text-lg font-semibold">{signals.indicators.volume.status}</div>
            </div>
          </div>
        </div>

        {/* Signal Analysis */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Signal Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="text-sm font-medium">RSI Signal</span>
                <p className="text-sm text-gray-500">{signals.signals.rsi.message}</p>
              </div>
              <SignalIndicator signal={signals.signals.rsi} />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="text-sm font-medium">MACD Signal</span>
                <p className="text-sm text-gray-500">{signals.signals.macd.message}</p>
              </div>
              <SignalIndicator signal={signals.signals.macd} />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="text-sm font-medium">Moving Averages</span>
                <p className="text-sm text-gray-500">{signals.signals.movingAverages.message}</p>
              </div>
              <SignalIndicator signal={signals.signals.movingAverages} />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="text-sm font-medium">Volume Analysis</span>
                <p className="text-sm text-gray-500">{signals.signals.volume.message}</p>
              </div>
              <SignalIndicator signal={signals.signals.volume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingSignals;
