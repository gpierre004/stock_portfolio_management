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
      WITH latest_prices AS (
        SELECT 
          ticker,
          purchase_price as current_price,
          ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY purchase_date DESC) as rn
        FROM transactions
        WHERE type = 'BUY'
      ),
      position_summary AS (
        SELECT 
          t.ticker,
          SUM(CASE WHEN type = 'BUY' THEN quantity ELSE -quantity END) as total_quantity,
          SUM(CASE WHEN type = 'BUY' THEN quantity * purchase_price ELSE 0 END) as total_invested,
          COUNT(*) as transaction_count
        FROM transactions t
        GROUP BY ticker 
        HAVING SUM(CASE WHEN type = 'BUY' THEN quantity ELSE -quantity END) > 0
      )
      SELECT 
        p.ticker,
        p.total_quantity,
        p.total_invested,
        p.total_quantity * l.current_price as current_value,
        (p.total_quantity * l.current_price) - p.total_invested as profit_loss,
        CASE 
          WHEN p.total_invested > 0 
          THEN ((p.total_quantity * l.current_price) - p.total_invested) / p.total_invested * 100
          ELSE 0 
        END as percent_change
      FROM position_summary p
      JOIN latest_prices l ON p.ticker = l.ticker AND l.rn = 1
      ORDER BY current_value DESC
    `);

    return rows.map(row => ({
      ...row,
      total_quantity: parseFloat(row.total_quantity),
      total_invested: parseFloat(row.total_invested),
      current_value: parseFloat(row.current_value),
      profit_loss: parseFloat(row.profit_loss),
      percent_change: parseFloat(row.percent_change)
    }));
  }
}
