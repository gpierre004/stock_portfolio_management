import express from 'express';
import TechnicalAnalysisService from '../services/technicalAnalysisService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/analysis/breakouts
 * @description Get potential breakout stocks based on technical analysis
 * @access Private
 */
router.get('/breakouts', authenticateToken, async (req, res) => {
    try {
        const data = await TechnicalAnalysisService.getBreakoutStocks();
        
        res.json({
            success: true,
            data,
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
        const data = await TechnicalAnalysisService.getBreakoutSummary();

        res.json({
            success: true,
            data,
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

/**
 * @route GET /api/analysis/stock/:symbol
 * @description Get detailed technical analysis for a specific stock
 * @access Private
 */
router.get('/stock/:symbol', auth, async (req, res) => {
    try {
        const { symbol } = req.params;
        const analysis = await TechnicalAnalysisService.getStockAnalysis(symbol);

        res.json({
            success: true,
            data: analysis,
            metadata: {
                timestamp: new Date(),
                description: `Detailed technical analysis for ${symbol}`
            }
        });
    } catch (error) {
        console.error(`Error fetching analysis for ${req.params.symbol}:`, error);
        res.status(error.message === 'Stock not found' ? 404 : 500).json({
            success: false,
            error: error.message || 'Failed to fetch stock analysis'
        });
    }
});

export default router;
