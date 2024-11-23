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
        purchase_price, Description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING purchase_id`,
      [
        transaction.ticker,
        transaction.purchase_date,
        transaction.quantity,
        transaction.type,
        transaction.comment || null,
        transaction.purchase_price,
        transaction.description || null
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

  async getPortfolioSummary(): Promise<PortfolioSummary[]> {
    const { rows } = await pool.query(`
      SELECT 
        ticker,
        current_quantity as total_quantity,
        total_invested,
        market_value as current_value,
        total_profit_loss as profit_loss,
        roi_percentage as percent_change
      FROM public.vw_profit_loss
      WHERE current_quantity > 0
      ORDER BY market_value DESC
    `);

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
