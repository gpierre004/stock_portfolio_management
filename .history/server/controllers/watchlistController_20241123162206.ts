import { Request, Response } from 'express';
import { db } from '../db';
import { QueryTypes } from 'sequelize';

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

      const watchlistItems = await db.query(
        `SELECT * FROM watchlists WHERE userid = :userId ORDER BY date_added DESC`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT
        }
      );

      return res.json({
        success: true,
        data: watchlistItems
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

      const [result] = await db.query(
        `INSERT INTO watchlists (
          ticker, 
          reason, 
          userid, 
          date_added,
          createdAt,
          updatedAt,
          currentPrice,
          weekHigh52,
          percentBelow52WeekHigh,
          avgClose,
          sector,
          priceWhenAdded
        ) VALUES (
          :ticker,
          :reason,
          :userId,
          CURRENT_DATE,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP,
          0,
          0,
          0,
          0,
          '',
          0
        ) RETURNING *`,
        {
          replacements: {
            ticker: ticker.toUpperCase(),
            reason,
            userId
          },
          type: QueryTypes.INSERT
        }
      );

      return res.json({
        success: true,
        data: [result]
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
      
      await db.query(
        `DELETE FROM watchlists WHERE id = :id AND userid = :userId`,
        {
          replacements: { id, userId },
          type: QueryTypes.DELETE
        }
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

      // Create SET clause dynamically from the updates object
      const setClause = Object.keys(updates)
        .map(key => `${key} = :${key}`)
        .join(', ');

      const [result] = await db.query(
        `UPDATE watchlists 
         SET ${setClause}, 
             updatedAt = CURRENT_TIMESTAMP
         WHERE id = :id AND userid = :userId
         RETURNING *`,
        {
          replacements: { ...updates, id, userId },
          type: QueryTypes.UPDATE
        }
      );

      return res.json({
        success: true,
        data: [result]
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
