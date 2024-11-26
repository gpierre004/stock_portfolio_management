import express from 'express';
import portfolioOptimizationService from '../services/portfolioOptimizationService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get portfolio optimization data
router.get('/optimization', authenticateToken, async (req, res) => {
  try {
    const accountId = req.query.accountId ? parseInt(req.query.accountId) : undefined;
    const holdings = await portfolioOptimizationService.getPortfolioHoldings(accountId);
    res.json(holdings);
  } catch (error) {
    console.error('Error fetching portfolio optimization data:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio optimization data' });
  }
});

// Calculate rebalancing suggestions
router.post('/optimization/rebalance', authenticateToken, async (req, res) => {
  try {
    const { targetAllocations, accountId } = req.body;
    const holdings = await portfolioOptimizationService.getPortfolioHoldings(accountId);
    const suggestions = portfolioOptimizationService.calculateRebalancingSuggestions(
      holdings,
      targetAllocations
    );
    res.json(suggestions);
  } catch (error) {
    console.error('Error calculating rebalancing suggestions:', error);
    res.status(500).json({ message: 'Failed to calculate rebalancing suggestions' });
  }
});

// Calculate what-if scenario
router.post('/optimization/scenario', auth, async (req, res) => {
  try {
    const { percentageChange, accountId } = req.body;
    const holdings = await portfolioOptimizationService.getPortfolioHoldings(accountId);
    const analysis = portfolioOptimizationService.calculateScenarioAnalysis(
      holdings,
      percentageChange
    );
    res.json(analysis);
  } catch (error) {
    console.error('Error calculating scenario analysis:', error);
    res.status(500).json({ message: 'Failed to calculate scenario analysis' });
  }
});

// Get dividend history
router.get('/optimization/dividends', auth, async (req, res) => {
  try {
    const accountId = req.query.accountId ? parseInt(req.query.accountId) : undefined;
    const dividendHistory = await portfolioOptimizationService.getDividendHistory(accountId);
    res.json(dividendHistory);
  } catch (error) {
    console.error('Error fetching dividend history:', error);
    res.status(500).json({ message: 'Failed to fetch dividend history' });
  }
});

export default router;
