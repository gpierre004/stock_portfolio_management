import api, { ENDPOINTS } from '../config/api';
import { WatchlistResponse, WatchlistItem } from '../types/watchlist';

export const watchlistService = {
  async getWatchlist(): Promise<WatchlistItem[]> {
    try {
      const response = await api.get<WatchlistResponse>(ENDPOINTS.WATCHLIST);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch watchlist');
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  },

  async addToWatchlist(ticker: string, reason?: string): Promise<WatchlistItem> {
    try {
      const response = await api.post<WatchlistResponse>(ENDPOINTS.WATCHLIST, {
        ticker,
        reason
      });
      if (response.data.success) {
        return response.data.data[0];
      }
      throw new Error(response.data.message || 'Failed to add to watchlist');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  },

  async removeFromWatchlist(id: number): Promise<void> {
    try {
      const response = await api.delete(`${ENDPOINTS.WATCHLIST}/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove from watchlist');
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  },

  async updateWatchlistItem(id: number, updates: Partial<WatchlistItem>): Promise<WatchlistItem> {
    try {
      const response = await api.put<WatchlistResponse>(`${ENDPOINTS.WATCHLIST}/${id}`, updates);
      if (response.data.success) {
        return response.data.data[0];
      }
      throw new Error(response.data.message || 'Failed to update watchlist item');
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      throw error;
    }
  }
};
