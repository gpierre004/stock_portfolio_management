import pool from '../db';
import { Transaction, PortfolioSummary } from '../types/transaction';

export class TransactionService {
  async getAllTransactions(): Promise<Transaction[]> {
    const result = await pool.query(
      'SELECT * FROM transactions ORDER BY purchase_date DESC'
    );
    return result.rows;
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
        SUM(CASE WHEN type = 'BUY' THEN quantity ELSE -quantity END) as total_quantity,
        SUM(CASE WHEN type = 'BUY' THEN quantity * purchase_price 
            ELSE -quantity * purchase_price END) as total_value
      FROM transactions 
      GROUP BY ticker 
      HAVING SUM(CASE WHEN type = 'BUY' THEN quantity ELSE -quantity END) > 0
    `);
    return rows;
  }
}
