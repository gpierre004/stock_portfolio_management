import db from '../config/database.js';

class TechnicalAnalysisService {
    /**
     * Get all potential breakout stocks
     * @returns {Promise<Array>} Array of stocks with breakout potential
     */
    static async getBreakoutStocks() {
        const result = await db.query(
            'SELECT * FROM vw_potential_breakouts WHERE potential_breakout = 1 ORDER BY volume_status DESC, trend_status DESC'
        );
        return result.rows;
    }

    /**
     * Get summary of breakout candidates grouped by trend status
     * @returns {Promise<Array>} Summary of breakout stocks
     */
    static async getBreakoutSummary() {
        const result = await db.query(`
            SELECT 
                trend_status,
                COUNT(*) as count,
                STRING_AGG(symbol, ', ') as symbols
            FROM vw_potential_breakouts 
            WHERE potential_breakout = 1
            GROUP BY trend_status
            ORDER BY 
                CASE trend_status 
                    WHEN 'Strong uptrend' THEN 1
                    WHEN 'Moderate uptrend' THEN 2
                    WHEN 'Neutral' THEN 3
                    WHEN 'Downtrend' THEN 4
                END
        `);
        return result.rows;
    }

    /**
     * Get detailed analysis for a specific stock
     * @param {string} symbol Stock symbol
     * @returns {Promise<Object>} Detailed technical analysis
     */
    static async getStockAnalysis(symbol) {
        const result = await db.query(
            'SELECT * FROM vw_potential_breakouts WHERE symbol = $1',
            [symbol]
        );
        
        if (result.rows.length === 0) {
            throw new Error('Stock not found');
        }

        return {
            ...result.rows[0],
            analysis_details: {
                moving_averages: {
                    sma_20: result.rows[0].sma_20,
                    sma_50: result.rows[0].sma_50,
                    trend: result.rows[0].trend_status
                },
                volume_analysis: {
                    current_volume: result.rows[0].volume,
                    avg_volume_20: result.rows[0].avg_volume_20,
                    status: result.rows[0].volume_status
                },
                breakout_indicators: {
                    is_potential_breakout: result.rows[0].potential_breakout,
                    price_change_pct: result.rows[0].price_change_pct
                }
            }
        };
    }

    /**
     * Get trading signals for a specific stock
     * @param {string} symbol Stock symbol
     * @returns {Promise<Object>} Trading signals and indicators
     */
    static async getTradingSignals(symbol) {
        const [priceData, breakoutData] = await Promise.all([
            db.query(
                `SELECT 
                    "closePrice",
                    volume,
                    "timestamp"
                FROM "stock_prices"
                WHERE symbol = $1
                ORDER BY "timestamp" DESC
                LIMIT 200`,
                [symbol]
            ),
            db.query(
                'SELECT * FROM vw_potential_breakouts WHERE symbol = $1',
                [symbol]
            )
        ]);

        if (priceData.rows.length === 0) {
            throw new Error('Stock not found');
        }

        const prices = priceData.rows;
        const latestPrice = prices[0].closePrice;
        const rsi = this.calculateRSI(prices);
        const macd = this.calculateMACD(prices);
        const volume = breakoutData.rows[0]?.volume || 0;
        const avgVolume = breakoutData.rows[0]?.avg_volume_20 || 0;

        return {
            ticker: symbol,
            timestamp: new Date().toISOString(),
            indicators: {
                rsi,
                macd: {
                    value: macd.macdLine,
                    signal: macd.signalLine,
                    histogram: macd.histogram
                },
                movingAverages: {
                    ma20: breakoutData.rows[0]?.sma_20 || 0,
                    ma50: breakoutData.rows[0]?.sma_50 || 0,
                    ma200: this.calculateSMA(prices, 200)
                },
                volume: {
                    current: volume,
                    average: avgVolume,
                    status: this.getVolumeStatus(volume, avgVolume)
                },
                supportResistance: this.calculateSupportResistance(prices, latestPrice)
            },
            signals: {
                rsi: this.getRSISignal(rsi),
                macd: this.getMACDSignal(macd),
                movingAverages: this.getMASignal(breakoutData.rows[0]),
                volume: this.getVolumeSignal(volume, avgVolume),
                supportResistance: this.getSRSignal(prices, latestPrice)
            }
        };
    }

    // Helper methods remain unchanged...
    static calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) {
            return 50;
        }

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const change = prices[i - 1].closePrice - prices[i].closePrice;
            if (change >= 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;
        
        const rs = avgGain / (avgLoss === 0 ? 1 : avgLoss);
        return 100 - (100 / (1 + rs));
    }

    static calculateMACD(prices) {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macdLine = ema12 - ema26;
        const signalLine = this.calculateEMA([{ closePrice: macdLine }], 9);
        
        return {
            macdLine,
            signalLine,
            histogram: macdLine - signalLine
        };
    }

    static calculateEMA(prices, period) {
        const multiplier = 2 / (period + 1);
        let ema = prices[prices.length - 1].closePrice;

        for (let i = prices.length - 2; i >= 0; i--) {
            ema = (prices[i].closePrice - ema) * multiplier + ema;
        }

        return ema;
    }

    static calculateSMA(prices, period) {
        if (prices.length < period) return 0;
        const sum = prices.slice(0, period).reduce((acc, price) => acc + price.closePrice, 0);
        return sum / period;
    }

    static calculateSupportResistance(prices, currentPrice) {
        const levels = prices.map(p => p.closePrice).sort((a, b) => a - b);
        const support = levels.reverse().find(price => price < currentPrice) || 0;
        const resistance = levels.find(price => price > currentPrice) || 0;

        return {
            support: [{
                level: support,
                distance: support ? ((support - currentPrice) / currentPrice) * 100 : 0
            }],
            resistance: [{
                level: resistance,
                distance: resistance ? ((resistance - currentPrice) / currentPrice) * 100 : 0
            }]
        };
    }

    static getRSISignal(rsi) {
        if (rsi > 70) {
            return { signal: 'SELL', message: 'Overbought conditions' };
        } else if (rsi < 30) {
            return { signal: 'BUY', message: 'Oversold conditions' };
        }
        return { signal: 'NEUTRAL', message: 'Normal RSI levels' };
    }

    static getMACDSignal(macd) {
        if (macd.histogram > 0 && macd.macdLine > 0) {
            return { signal: 'BUY', message: 'Bullish MACD crossover' };
        } else if (macd.histogram < 0 && macd.macdLine < 0) {
            return { signal: 'SELL', message: 'Bearish MACD crossover' };
        }
        return { signal: 'NEUTRAL', message: 'No clear MACD signal' };
    }

    static getMASignal(breakoutData) {
        if (!breakoutData) {
            return { signal: 'NEUTRAL', message: 'Insufficient data' };
        }

        if (breakoutData.trend_status === 'Strong uptrend') {
            return { signal: 'BUY', message: 'Strong upward trend confirmed' };
        } else if (breakoutData.trend_status === 'Downtrend') {
            return { signal: 'SELL', message: 'Downward trend confirmed' };
        }
        return { signal: 'NEUTRAL', message: 'No clear trend' };
    }

    static getVolumeStatus(current, average) {
        if (current > average * 2) return 'Very High';
        if (current > average * 1.5) return 'High';
        if (current > average) return 'Above Average';
        return 'Normal';
    }

    static getVolumeSignal(current, average) {
        if (current > average * 2) {
            return { signal: 'ALERT', message: 'Unusually high volume' };
        } else if (current > average * 1.5) {
            return { signal: 'CAUTION', message: 'Volume spike detected' };
        }
        return { signal: 'NEUTRAL', message: 'Normal volume levels' };
    }

    static getSRSignal(prices, currentPrice) {
        const { support, resistance } = this.calculateSupportResistance(prices, currentPrice);
        
        if (Math.abs(resistance[0].distance) < 2) {
            return { signal: 'CAUTION', message: 'Near resistance level' };
        } else if (Math.abs(support[0].distance) < 2) {
            return { signal: 'ALERT', message: 'Near support level' };
        }
        return { signal: 'NEUTRAL', message: 'Away from key levels' };
    }
}

export default TechnicalAnalysisService;
