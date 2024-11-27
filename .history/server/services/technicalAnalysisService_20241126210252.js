import db from '../config/database.js';

class TechnicalAnalysisService {
    /**
     * Get all potential breakout stocks
     * @returns {Promise<Array>} Array of stocks with breakout potential
     */
    static async getBreakoutStocks() {
        const result = await db.query(
            'SELECT * FROM vw_potential_breakouts ORDER BY volume_status DESC, trend_status DESC'
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
                STRING_AGG("stockSymbol", ', ') as symbols
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
            'SELECT * FROM vw_potential_breakouts WHERE "stockSymbol" = $1',
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
}

module.exports = TechnicalAnalysisService;
