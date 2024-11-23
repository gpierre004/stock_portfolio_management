export interface Transaction {
  purchase_id?: number;
  ticker: string;
  purchase_date: string;
  quantity: number;
  type: 'BUY' | 'SELL';
  comment?: string;
  purchase_price: number;
  description?: string;
  account_id: number;
}

export interface PortfolioSummary {
  ticker: string;
  total_quantity: number;
  total_invested: number;
  current_value: number;
  profit_loss: number;
  percent_change: number;
}
