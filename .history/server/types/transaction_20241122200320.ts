export interface Transaction {
  purchase_id?: number;
  ticker: string;
  purchase_date: string;
  quantity: number;
  type: 'BUY' | 'SELL';
  comment?: string;
  purchase_price: number;
  description?: string;
}

export interface PortfolioSummary {
  ticker: string;
  total_quantity: number;
  total_value: number;
}