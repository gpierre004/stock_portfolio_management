import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api, { ENDPOINTS } from '../config/api';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { authService } from '../services/authService';

interface TradingSignal {
  signal: 'BUY' | 'SELL' | 'NEUTRAL' | 'ALERT' | 'CAUTION';
  message: string;
}

interface SupportResistanceLevel {
  level: number;
  distance: number;
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
  supportResistance: {
    support: SupportResistanceLevel[];
    resistance: SupportResistanceLevel[];
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
    supportResistance: TradingSignal;
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
      if (!authService.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      try {
        const { data } = await api.get(`${ENDPOINTS.TECHNICAL_ANALYSIS.SIGNALS}/${ticker}`);
        return data;
      } catch (err: any) {
        console.error('Error fetching trading signals:', {
          error: err,
          status: err.response?.status,
          message: err.response?.data?.message,
          token: authService.getToken()
        });
        throw err;
      }
    },
    refetchInterval: 60000,
    enabled: !!ticker && authService.isAuthenticated(),
    retry: false
  });

  if (!authService.isAuthenticated()) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Please log in to view trading signals</p>
      </div>
    );
  }

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
        <p className="text-red-800">
          {error instanceof Error ? error.message : 'Error loading trading signals'}
        </p>
      </div>
    );
  }

  if (!signals) {
    return null;
  }

  const {
    indicators: {
      rsi = 0,
      macd = { value: 0, signal: 0, histogram: 0 },
      movingAverages = { ma20: 0, ma50: 0, ma200: 0 },
      volume = { current: 0, average: 0, status: 'Normal' },
      supportResistance = { support: [], resistance: [] }
    } = {},
    signals: signalData = {
      rsi: { signal: 'NEUTRAL', message: 'No data' },
      macd: { signal: 'NEUTRAL', message: 'No data' },
      movingAverages: { signal: 'NEUTRAL', message: 'No data' },
      volume: { signal: 'NEUTRAL', message: 'No data' },
      supportResistance: { signal: 'NEUTRAL', message: 'No data' }
    }
  } = signals;

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
              <div className="text-lg font-semibold">{rsi}</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <span className="text-sm text-gray-500">MACD</span>
              <div className="text-lg font-semibold">{macd.value}</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <span className="text-sm text-gray-500">MA (20)</span>
              <div className="text-lg font-semibold">${movingAverages.ma20}</div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <span className="text-sm text-gray-500">Volume</span>
              <div className="text-lg font-semibold">{volume.status}</div>
            </div>
          </div>
        </div>

        {/* Support & Resistance Levels */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Support & Resistance Levels</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-3">
              <span className="text-sm text-gray-500">Support Level</span>
              {supportResistance.support[0] ? (
                <div className="mt-2">
                  <div className="text-lg font-semibold">${supportResistance.support[0].level.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">
                    {Math.abs(supportResistance.support[0].distance).toFixed(2)}% away
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 mt-2">No support level detected</div>
              )}
            </div>
            <div className="bg-gray-50 rounded p-3">
              <span className="text-sm text-gray-500">Resistance Level</span>
              {supportResistance.resistance[0] ? (
                <div className="mt-2">
                  <div className="text-lg font-semibold">${supportResistance.resistance[0].level.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">
                    {Math.abs(supportResistance.resistance[0].distance).toFixed(2)}% away
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 mt-2">No resistance level detected</div>
              )}
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
                <p className="text-sm text-gray-500">{signalData.rsi.message}</p>
              </div>
              <SignalIndicator signal={signalData.rsi} />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="text-sm font-medium">MACD Signal</span>
                <p className="text-sm text-gray-500">{signalData.macd.message}</p>
              </div>
              <SignalIndicator signal={signalData.macd} />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="text-sm font-medium">Moving Averages</span>
                <p className="text-sm text-gray-500">{signalData.movingAverages.message}</p>
              </div>
              <SignalIndicator signal={signalData.movingAverages} />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="text-sm font-medium">Volume Analysis</span>
                <p className="text-sm text-gray-500">{signalData.volume.message}</p>
              </div>
              <SignalIndicator signal={signalData.volume} />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="text-sm font-medium">Support/Resistance</span>
                <p className="text-sm text-gray-500">{signalData.supportResistance.message}</p>
              </div>
              <SignalIndicator signal={signalData.supportResistance} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingSignals;
