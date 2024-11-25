import express from 'express';
import TechnicalAnalysisService from '../services/technicalAnalysisService.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'Technical analysis routes are working' });
});

/**
 * @route GET /api/analysis/breakouts
 * @description Get potential breakout stocks based on technical analysis
 * @access Private
 */
router.get('/breakouts', authenticateToken, async (req, res) => {
    try {
        logger.info('Fetching breakout stocks');
        const data = await TechnicalAnalysisService.getBreakoutStocks();
        logger.info(`Found ${data.length} breakout stocks`);
        
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
        logger.error('Error fetching breakout analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch breakout analysis',
            details: error.message
        });
    }
});

/**
 * @route GET /api/analysis/breakouts/summary
 * @description Get a summary of breakout candidates grouped by trend status
 * @access Private
 */
router.get('/breakouts/summary', authenticateToken, async (req, res) => {
    try {
        const data = await TechnicalAnalysisService.getBreakoutSummary();
        logger.info('Successfully fetched breakout summary');

        res.json({
            success: true,
            data,
            metadata: {
                timestamp: new Date(),
                description: 'Summary of potential breakout stocks grouped by trend status'
            }
        });
    } catch (error) {
        logger.error('Error fetching breakout summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch breakout summary',
            details: error.message
        });
    }
});

/**
 * @route GET /api/analysis/stock/:symbol
 * @description Get detailed technical analysis for a specific stock
 * @access Private
 */
router.get('/stock/:symbol', authenticateToken, async (req, res) => {
    try {
        const { symbol } = req.params;
        logger.info(`Fetching analysis for stock: ${symbol}`);
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
        logger.error(`Error fetching analysis for ${req.params.symbol}:`, error);
        res.status(error.message === 'Stock not found' ? 404 : 500).json({
            success: false,
            error: error.message || 'Failed to fetch stock analysis'
        });
    }
});

/**
 * @route GET /api/analysis/signals/:symbol
 * @description Get trading signals and indicators for a specific stock
 * @access Private
 */
router.get('/signals/:symbol', authenticateToken, async (req, res) => {
    try {
        const { symbol } = req.params;
        logger.info(`Fetching trading signals for stock: ${symbol}`);
        const signals = await TechnicalAnalysisService.getTradingSignals(symbol);

        res.json(signals); // TradingSignals component expects direct response without wrapper
    } catch (error) {
        logger.error(`Error fetching signals for ${req.params.symbol}:`, error);
        res.status(error.message === 'Stock not found' ? 404 : 500).json({
            success: false,
            error: error.message || 'Failed to fetch trading signals'
        });
    }
});

export default router;
