import express from 'express';
import { watchlistController } from '../controllers/watchlistController';
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

export default router;
