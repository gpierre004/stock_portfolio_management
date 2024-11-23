export interface WatchlistItem {
  id: number;
  date_added: string;
  reason: string | null;
  ticker: string;
  userid: number;
  createdAt: string;
  updatedAt: string;
  currentPrice: number;
  weekHigh52: number;
  percentBelow52WeekHigh: number;
  avgClose: number;
  sector: string;
  priceWhenAdded: number;
  priceChange: number | null;
  lastUpdated: string;
  interested: boolean | null;
  metrics: {
    [key: string]: any;
  } | null;
  industry: string | null;
}

export interface WatchlistResponse {
  success: boolean;
  data: WatchlistItem[];
  message?: string;
}

export interface WatchlistError {
  success: boolean;
  error: string;
}
