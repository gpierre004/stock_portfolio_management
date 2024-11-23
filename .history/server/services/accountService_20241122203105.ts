import pool from '../db';
import { Account, CreateAccountDTO } from '../types/account';

export class AccountService {
  async getAccounts(userId: number): Promise<Account[]> {
    const result = await pool.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY name',
      [userId]
    );
    return result.rows;
  }

  async createAccount(accountData: CreateAccountDTO): Promise<Account> {
    const { rows } = await pool.query(
      `INSERT INTO accounts (name, description, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [accountData.name, accountData.description, accountData.user_id]
    );
    return rows[0];
  }

  async updateBalance(accountId: number, amount: number): Promise<void> {
    await pool.query(
      `UPDATE accounts 
       SET balance = balance + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE account_id = $2`,
      [amount, accountId]
    );
  }
}
