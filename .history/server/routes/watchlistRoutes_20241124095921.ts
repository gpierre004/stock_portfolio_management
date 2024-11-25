import express from 'express';
import { watchlistController } from '../controllers/watchlistController';
import { 
    getWatchList, updateWatchListPrices, cleanupWatchList, refreshWatchList 
  } from '../services/watchlistService.ts';import logger from '../utils/logger.js';

import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all watchlist routes
router.use(authenticateToken);

// Get all watchlist items for the authenticated user
router.get('/', watchlistController.getWatchlist);

// Add a new item to the watchlist
router.post('/', watchlistController.addToWatchlist);

// Remove an item from the watchlist
router.delete('/:id', watchlistController.removeFromWatchlist);

// Update a watchlist item
router.put('/:id', watchlistController.updateWatchlistItem);

router.get('/', async (req, res) => {
    try {
      const watchList = await getWatchList();
      res.json(watchList);
    } catch (error) {
      logger.error(`Error fetching watchlist: ${error.message}`);
      res.status(500).json({ error: 'Error fetching watchlist' });
    }
  });
  
  router.put('/update-prices', async (req, res) => {
    try {
      const result = await updateWatchListPrices();
      res.json(result);
    } catch (error) {
      logger.error(`Error updating watch list prices: ${error.message}`);
      res.status(500).json({ error: 'Error updating watch list prices' });
    }
  });
  
  router.delete('/cleanup', async (req, res) => {
    try {
      const result = await cleanupWatchList();
      res.json(result);
    } catch (error) {
      logger.error(`Error cleaning up watch list: ${error.message}`);
      res.status(500).json({ error: 'Error cleaning up watch list' });
    }
  });
  
  router.post('/refresh', async (req, res) => {
    try {
      const result = await refreshWatchList();
      res.json(result);
    } catch (error) {
      logger.error(`Error refreshing watch list: ${error.message}`);
      res.status(500).json({ error: 'Error refreshing watch list' });
    }
  });
  

export default router;
