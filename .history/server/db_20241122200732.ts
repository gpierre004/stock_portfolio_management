import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sp500_analysis',
  password: 'po',
  port: 5432,
});

export default pool;