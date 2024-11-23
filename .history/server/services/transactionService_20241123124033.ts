import pool from '../db';
import { Transaction, PortfolioSummary } from '../types/transaction';

export class TransactionService {
  async getAllTransactions(): Promise<Transaction[]> {
    const result = await pool.query(
      'SELECT * FROM transactions ORDER BY purchase_date DESC'
    );
    return result.rows.map(row => ({
      ...row,
      quantity: parseFloat(row.quantity),
      purchase_price: parseFloat(row.purchase_price)
    }));
  }

  async createTransaction(transaction: Transaction): Promise<number> {
    const { rows } = await pool.query(
      `INSERT INTO transactions (
        ticker, purchase_date, quantity, type, comment,
        purchase_price, description, account_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING purchase_id`,
      [
        transaction.ticker,
        transaction.purchase_date,
        transaction.quantity,
        transaction.type,
        transaction.comment || null,
        transaction.purchase_price,
        transaction.description || null,
        transaction.account_id
      ]
    );
    return rows[0].purchase_id;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM transactions WHERE purchase_id = $1',
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getPortfolioSummary(accountId?: number | null): Promise<PortfolioSummary[]> {
    const query = accountId 
      ? `
        SELECT 
          ticker,
          current_quantity as total_quantity,
          total_invested,
          market_value as current_value,
          total_profit_loss as profit_loss,
          roi_percentage as percent_change
        FROM public.vw_profit_loss
        WHERE current_quantity > 0
          AND "AccountId" = $1
        ORDER BY roi_percentage DESC
      `
      : `
        SELECT 
          ticker,
          SUM(current_quantity) as total_quantity,
          SUM(total_invested) as total_invested,
          SUM(market_value) as current_value,
          SUM(total_profit_loss) as profit_loss,
          CASE 
            WHEN SUM(total_invested) > 0 
            THEN (SUM(market_value) - SUM(total_invested)) / SUM(total_invested) * 100
            ELSE 0 
          END as percent_change
        FROM public.vw_profit_loss
        WHERE current_quantity > 0
        GROUP BY ticker
        HAVING SUM(current_quantity) > 0
        ORDER BY 
          CASE 
            WHEN SUM(total_invested) > 0 
            THEN (SUM(market_value) - SUM(total_invested)) / SUM(total_invested) * 100
            ELSE 0 
          END DESC
      `;

    const { rows } = await pool.query(
      query,
      accountId ? [accountId] : []
    );

    return rows.map(row => ({
      ...row,
      total_quantity: parseFloat(row.total_quantity) || 0,
      total_invested: parseFloat(row.total_invested) || 0,
      current_value: parseFloat(row.current_value) || 0,
      profit_loss: parseFloat(row.profit_loss) || 0,
      percent_change: parseFloat(row.percent_change) || 0
    }));
  }
}
