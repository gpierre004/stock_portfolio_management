import express from 'express';
import TechnicalAnalysisService from '../services/technicalAnalysisService.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Test endpoint without auth
router.get('/test', (req, res) => {
    res.json({ message: 'Technical analysis routes are working' });
});

// Test endpoint for breakouts without auth
router.get('/breakouts/test', async (req, res) => {
    try {
        logger.info('Testing breakout stocks endpoint');
        const data = await TechnicalAnalysisService.getBreakoutStocks();
        logger.info(`Found ${data.length} breakout stocks`);
        
        res.json({
            success: true,
            data,
            metadata: {
                timestamp: new Date(),
                description: 'Test endpoint for breakout stocks'
            }
        });
    } catch (error) {
        logger.error('Error in test breakout endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch breakout stocks',
            details: error.message
        });
    }
});

// Original endpoints with auth
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
