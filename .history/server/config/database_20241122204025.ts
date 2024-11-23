import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'stock_portfolio',
  password: '1215',
  port: 5432,
});

export default pool;
