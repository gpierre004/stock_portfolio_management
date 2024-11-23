import axios from 'axios';
import { WatchlistResponse, WatchlistItem } from '../types/watchlist';
import { API_BASE_URL } from '../config/api';

export const watchlistService = {
  async getWatchlist(): Promise<WatchlistItem[]> {
    try {
      const response = await axios.get<WatchlistResponse>(`${API_BASE_URL}/api/watchlist`);
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
      const response = await axios.post<WatchlistResponse>(`${API_BASE_URL}/api/watchlist`, {
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
      const response = await axios.delete(`${API_BASE_URL}/api/watchlist/${id}`);
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
      const response = await axios.put<WatchlistResponse>(`${API_BASE_URL}/api/watchlist/${id}`, updates);
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
