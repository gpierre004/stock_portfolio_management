import pool from '../db.js';

class TechnicalAnalysisService {
  async calculateRSI(ticker, period = 14) {
    const query = `
      WITH price_changes AS (
        SELECT 
          ticker,
          date,
          close as price,
          close - LAG(close) OVER (PARTITION BY ticker ORDER BY date) as price_change
        FROM stock_prices
        WHERE ticker = $1
        ORDER BY date DESC
        LIMIT $2
      ),
      gains_losses AS (
        SELECT 
          ticker,
          date,
          CASE WHEN price_change >= 0 THEN price_change ELSE 0 END as gain,
          CASE WHEN price_change < 0 THEN ABS(price_change) ELSE 0 END as loss
        FROM price_changes
        WHERE price_change IS NOT NULL
      ),
      avg_gains_losses AS (
        SELECT 
          ticker,
          date,
          AVG(gain) OVER (ORDER BY date ROWS BETWEEN $3-1 PRECEDING AND CURRENT ROW) as avg_gain,
          AVG(loss) OVER (ORDER BY date ROWS BETWEEN $3-1 PRECEDING AND CURRENT ROW) as avg_loss
        FROM gains_losses
      )
      SELECT 
        ticker,
        date,
        CASE 
          WHEN avg_loss = 0 THEN 100 
          ELSE 100 - (100 / (1 + (avg_gain / avg_loss)))
        END as rsi
      FROM avg_gains_losses
      ORDER BY date DESC
      LIMIT 1;
    `;

    const result = await pool.query(query, [ticker, period + 1, period]);
    return result.rows[0];
  }

  async calculateMACD(ticker) {
    const query = `
      WITH ema_calc AS (
        SELECT 
          ticker,
          timestamp,
          price,
          AVG(price) OVER (PARTITION BY ticker ORDER BY timestamp ROWS BETWEEN 11 PRECEDING AND CURRENT ROW) as ema_12,
          AVG(price) OVER (PARTITION BY ticker ORDER BY timestamp ROWS BETWEEN 25 PRECEDING AND CURRENT ROW) as ema_26
        FROM stock_prices
        WHERE ticker = $1
        ORDER BY timestamp DESC
        LIMIT 26
      )
      SELECT 
        ticker,
        timestamp,
        ema_12 - ema_26 as macd,
        AVG(ema_12 - ema_26) OVER (ORDER BY timestamp ROWS BETWEEN 8 PRECEDING AND CURRENT ROW) as signal_line
      FROM ema_calc
      WHERE ema_12 IS NOT NULL AND ema_26 IS NOT NULL
      ORDER BY timestamp DESC
      LIMIT 1;
    `;

    const result = await pool.query(query, [ticker]);
    return result.rows[0];
  }

  async calculateMovingAverages(ticker) {
    const query = `
      WITH moving_avgs AS (
        SELECT 
          ticker,
          timestamp,
          price,
          AVG(price) OVER (PARTITION BY ticker ORDER BY timestamp ROWS BETWEEN 19 PRECEDING AND CURRENT ROW) as ma_20,
          AVG(price) OVER (PARTITION BY ticker ORDER BY timestamp ROWS BETWEEN 49 PRECEDING AND CURRENT ROW) as ma_50,
          AVG(price) OVER (PARTITION BY ticker ORDER BY timestamp ROWS BETWEEN 199 PRECEDING AND CURRENT ROW) as ma_200
        FROM stock_prices
        WHERE ticker = $1
        ORDER BY timestamp DESC
        LIMIT 200
      )
      SELECT *
      FROM moving_avgs
      WHERE ma_20 IS NOT NULL AND ma_50 IS NOT NULL AND ma_200 IS NOT NULL
      ORDER BY timestamp DESC
      LIMIT 1;
    `;

    const result = await pool.query(query, [ticker]);
    return result.rows[0];
  }

  async analyzeVolume(ticker) {
    const query = `
      WITH volume_stats AS (
        SELECT 
          ticker,
          timestamp,
          volume,
          AVG(volume) OVER (PARTITION BY ticker ORDER BY timestamp ROWS BETWEEN 19 PRECEDING AND CURRENT ROW) as avg_volume,
          STDDEV(volume) OVER (PARTITION BY ticker ORDER BY timestamp ROWS BETWEEN 19 PRECEDING AND CURRENT ROW) as volume_stddev
        FROM stock_prices
        WHERE ticker = $1
        ORDER BY timestamp DESC
        LIMIT 20
      )
      SELECT 
        ticker,
        timestamp,
        volume,
        avg_volume,
        CASE 
          WHEN volume > (avg_volume + 2 * volume_stddev) THEN 'Unusually High'
          WHEN volume < (avg_volume - 2 * volume_stddev) THEN 'Unusually Low'
          ELSE 'Normal'
        END as volume_status
      FROM volume_stats
      WHERE avg_volume IS NOT NULL AND volume_stddev IS NOT NULL
      ORDER BY timestamp DESC
      LIMIT 1;
    `;

    const result = await pool.query(query, [ticker]);
    return result.rows[0];
  }

  async generateTradingSignals(ticker) {
    const [rsi, macd, ma, volume] = await Promise.all([
      this.calculateRSI(ticker),
      this.calculateMACD(ticker),
      this.calculateMovingAverages(ticker),
      this.analyzeVolume(ticker)
    ]);

    const signals = {
      ticker,
      timestamp: new Date(),
      indicators: {
        rsi: rsi?.rsi,
        macd: {
          value: macd?.macd,
          signal: macd?.signal_line,
          histogram: macd?.macd - macd?.signal_line
        },
        movingAverages: {
          ma20: ma?.ma_20,
          ma50: ma?.ma_50,
          ma200: ma?.ma_200
        },
        volume: {
          current: volume?.volume,
          average: volume?.avg_volume,
          status: volume?.volume_status
        }
      },
      signals: {
        rsi: this._interpretRSI(rsi?.rsi),
        macd: this._interpretMACD(macd?.macd, macd?.signal_line),
        movingAverages: this._interpretMA(ma?.ma_20, ma?.ma_50, ma?.ma_200, ma?.price),
        volume: this._interpretVolume(volume?.volume_status)
      }
    };

    return signals;
  }

  _interpretRSI(rsi) {
    if (!rsi) return { signal: 'NEUTRAL', message: 'Insufficient data' };
    
    if (rsi > 70) {
      return { signal: 'SELL', message: 'Overbought - RSI above 70' };
    } else if (rsi < 30) {
      return { signal: 'BUY', message: 'Oversold - RSI below 30' };
    }
    return { signal: 'NEUTRAL', message: 'RSI in neutral zone' };
  }

  _interpretMACD(macd, signalLine) {
    if (!macd || !signalLine) return { signal: 'NEUTRAL', message: 'Insufficient data' };

    if (macd > signalLine) {
      return { signal: 'BUY', message: 'MACD crossed above signal line' };
    } else if (macd < signalLine) {
      return { signal: 'SELL', message: 'MACD crossed below signal line' };
    }
    return { signal: 'NEUTRAL', message: 'MACD and signal line aligned' };
  }

  _interpretMA(ma20, ma50, ma200, currentPrice) {
    if (!ma20 || !ma50 || !ma200 || !currentPrice) {
      return { signal: 'NEUTRAL', message: 'Insufficient data' };
    }

    const signals = [];
    if (currentPrice > ma200) {
      signals.push('Price above 200-day MA (Bullish long-term trend)');
    } else {
      signals.push('Price below 200-day MA (Bearish long-term trend)');
    }

    if (ma20 > ma50 && ma50 > ma200) {
      signals.push('Golden cross formation (Strong bullish signal)');
    } else if (ma20 < ma50 && ma50 < ma200) {
      signals.push('Death cross formation (Strong bearish signal)');
    }

    return {
      signal: signals.length > 0 ? (signals[0].includes('Bullish') ? 'BUY' : 'SELL') : 'NEUTRAL',
      message: signals.join('; ') || 'No clear moving average signals'
    };
  }

  _interpretVolume(volumeStatus) {
    if (!volumeStatus) return { signal: 'NEUTRAL', message: 'Insufficient data' };

    switch (volumeStatus) {
      case 'Unusually High':
        return { signal: 'ALERT', message: 'Unusually high volume detected - potential trend confirmation' };
      case 'Unusually Low':
        return { signal: 'CAUTION', message: 'Unusually low volume detected - potential weak price action' };
      default:
        return { signal: 'NEUTRAL', message: 'Normal trading volume' };
    }
  }
}

export default new TechnicalAnalysisService();
