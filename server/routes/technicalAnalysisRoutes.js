import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import technicalAnalysisService from '../services/technicalAnalysisService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get trading signals for a specific ticker
router.get('/signals/:ticker', authenticateToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    logger.info(`Generating trading signals for ticker: ${ticker}, user: ${req.user?.email}`);

    const signals = await technicalAnalysisService.generateTradingSignals(ticker);
    logger.info(`Successfully generated signals for ${ticker}`);

    res.json(signals);
  } catch (error) {
    logger.error('Error generating trading signals:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate trading signals',
      error: error.message
    });
  }
});

// Get RSI for a specific ticker
router.get('/indicators/rsi/:ticker', authenticateToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    const period = req.query.period ? parseInt(req.query.period) : 14;
    logger.info(`Calculating RSI for ticker: ${ticker}, period: ${period}`);

    const rsi = await technicalAnalysisService.calculateRSI(ticker, period);
    res.json(rsi);
  } catch (error) {
    logger.error('Error calculating RSI:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to calculate RSI',
      error: error.message
    });
  }
});

// Get MACD for a specific ticker
router.get('/indicators/macd/:ticker', authenticateToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    logger.info(`Calculating MACD for ticker: ${ticker}`);

    const macd = await technicalAnalysisService.calculateMACD(ticker);
    res.json(macd);
  } catch (error) {
    logger.error('Error calculating MACD:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to calculate MACD',
      error: error.message
    });
  }
});

// Get Moving Averages for a specific ticker
router.get('/indicators/ma/:ticker', authenticateToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    logger.info(`Calculating Moving Averages for ticker: ${ticker}`);

    const ma = await technicalAnalysisService.calculateMovingAverages(ticker);
    res.json(ma);
  } catch (error) {
    logger.error('Error calculating Moving Averages:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to calculate Moving Averages',
      error: error.message
    });
  }
});

// Get Volume Analysis for a specific ticker
router.get('/indicators/volume/:ticker', authenticateToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    logger.info(`Analyzing volume for ticker: ${ticker}`);

    const volume = await technicalAnalysisService.analyzeVolume(ticker);
    res.json(volume);
  } catch (error) {
    logger.error('Error analyzing volume:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to analyze volume',
      error: error.message
    });
  }
});

// Add error handling middleware specific to technical analysis routes
router.use((err, req, res, next) => {
  logger.error('Technical Analysis Route Error:', {
    error: err,
    path: req.path,
    user: req.user?.email
  });
  
  res.status(500).json({ 
    success: false,
    message: 'Internal server error in technical analysis',
    error: err.message 
  });
});

export default router;
