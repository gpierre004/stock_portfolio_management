import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import technicalAnalysisService from '../services/technicalAnalysisService.js';

const router = express.Router();

// Get trading signals for a specific ticker
router.get('/signals/:ticker', authenticateToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    const signals = await technicalAnalysisService.generateTradingSignals(ticker);
    res.json(signals);
  } catch (error) {
    console.error('Error generating trading signals:', error);
    res.status(500).json({ message: 'Failed to generate trading signals' });
  }
});

// Get RSI for a specific ticker
router.get('/indicators/rsi/:ticker', authenticateToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    const period = req.query.period ? parseInt(req.query.period) : 14;
    const rsi = await technicalAnalysisService.calculateRSI(ticker, period);
    res.json(rsi);
  } catch (error) {
    console.error('Error calculating RSI:', error);
    res.status(500).json({ message: 'Failed to calculate RSI' });
  }
});

// Get MACD for a specific ticker
router.get('/indicators/macd/:ticker', authenticateToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    const macd = await technicalAnalysisService.calculateMACD(ticker);
    res.json(macd);
  } catch (error) {
    console.error('Error calculating MACD:', error);
    res.status(500).json({ message: 'Failed to calculate MACD' });
  }
});

// Get Moving Averages for a specific ticker
router.get('/indicators/ma/:ticker', authenticateToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    const ma = await technicalAnalysisService.calculateMovingAverages(ticker);
    res.json(ma);
  } catch (error) {
    console.error('Error calculating Moving Averages:', error);
    res.status(500).json({ message: 'Failed to calculate Moving Averages' });
  }
});

// Get Volume Analysis for a specific ticker
router.get('/indicators/volume/:ticker', authenticateToken, async (req, res) => {
  try {
    const { ticker } = req.params;
    const volume = await technicalAnalysisService.analyzeVolume(ticker);
    res.json(volume);
  } catch (error) {
    console.error('Error analyzing volume:', error);
    res.status(500).json({ message: 'Failed to analyze volume' });
  }
});

// Add error logging middleware
router.use((err, req, res, next) => {
  console.error('Technical Analysis Route Error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error in technical analysis',
    error: err.message 
  });
});

export default router;
