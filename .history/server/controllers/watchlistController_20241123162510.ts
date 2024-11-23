import { Request, Response } from 'express';
import pool from '../config/database';

export const watchlistController = {
  async getWatchlist(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const result = await pool.query(
        'SELECT * FROM watchlists WHERE userid = $1 ORDER BY date_added DESC',
        [userId]
      );

      return res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch watchlist'
      });
    }
  },

  async addToWatchlist(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { ticker, reason } = req.body;
      if (!ticker) {
        return res.status(400).json({
          success: false,
          error: 'Ticker symbol is required'
        });
      }

      const result = await pool.query(
        `INSERT INTO watchlists (
          ticker, 
          reason, 
          userid, 
          date_added,
          "createdAt",
          "updatedAt",
          "currentPrice",
          "weekHigh52",
          "percentBelow52WeekHigh",
          "avgClose",
          sector,
          "priceWhenAdded"
        ) VALUES (
          $1, $2, $3, 
          CURRENT_DATE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP,
          0, 0, 0, 0, '', 0
        ) RETURNING *`,
        [ticker.toUpperCase(), reason, userId]
      );

      return res.json({
        success: true,
        data: [result.rows[0]]
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to add to watchlist'
      });
    }
  },

  async removeFromWatchlist(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { id } = req.params;
      
      await pool.query(
        'DELETE FROM watchlists WHERE id = $1 AND userid = $2',
        [id, userId]
      );

      return res.json({
        success: true,
        message: 'Item removed from watchlist'
      });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to remove from watchlist'
      });
    }
  },

  async updateWatchlistItem(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { id } = req.params;
      const updates = req.body;

      // Create SET clause and values array dynamically
      const setEntries = Object.entries(updates);
      const setClauses = setEntries.map((_, index) => `"${setEntries[index][0]}" = $${index + 3}`);
      const values = setEntries.map(entry => entry[1]);

      const query = `
        UPDATE watchlists 
        SET ${setClauses.join(', ')}, 
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $1 AND userid = $2
        RETURNING *
      `;

      const result = await pool.query(query, [id, userId, ...values]);

      return res.json({
        success: true,
        data: [result.rows[0]]
      });
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update watchlist item'
      });
    }
  }
};
