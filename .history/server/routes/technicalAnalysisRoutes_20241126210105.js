const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

/**
 * @route GET /api/analysis/breakouts
 * @description Get potential breakout stocks based on technical analysis
 * @access Private
 */
router.get('/breakouts', auth, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM vw_potential_breakouts ORDER BY volume_status DESC, trend_status DESC'
        );
        
        res.json({
            success: true,
            data: result.rows,
            metadata: {
                timestamp: new Date(),
                description: 'Stocks showing potential breakout patterns based on technical analysis',
                indicators: [
                    'Moving averages (20-day and 50-day)',
                    'Volume analysis',
                    'Price momentum',
                    'Trend strength'
                ]
            }
        });
    } catch (error) {
        console.error('Error fetching breakout analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch breakout analysis'
        });
    }
});

/**
 * @route GET /api/analysis/breakouts/summary
 * @description Get a summary of breakout candidates grouped by trend status
 * @access Private
 */
router.get('/breakouts/summary', auth, async (req, res) => {
    try {
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

        res.json({
            success: true,
            data: result.rows,
            metadata: {
                timestamp: new Date(),
                description: 'Summary of potential breakout stocks grouped by trend status'
            }
        });
    } catch (error) {
        console.error('Error fetching breakout summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch breakout summary'
        });
    }
});

module.exports = router;
