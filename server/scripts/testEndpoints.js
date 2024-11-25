import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_URL = 'http://localhost:3001/api';

async function testEndpoints() {
    try {
        // 1. Test server health
        console.log('1. Testing server health...');
        try {
            const healthResponse = await axios.get(`${API_URL}/analysis/test`);
            console.log('Health check response:', healthResponse.data);
        } catch (error) {
            console.error('Health check failed:', error.response?.data || error.message);
        }

        // 2. Test authentication
        console.log('\n2. Testing authentication...');
        let token;
        try {
            const authResponse = await axios.post(`${API_URL}/auth/login`, {
                email: 'test@example.com',
                password: 'password123'
            });
            token = authResponse.data.token;
            console.log('Authentication successful, token received');
        } catch (error) {
            console.error('Authentication failed:', error.response?.data || error.message);
            return; // Stop if auth fails
        }

        // 3. Test breakouts endpoint without auth
        console.log('\n3. Testing breakouts endpoint without auth...');
        try {
            await axios.get(`${API_URL}/analysis/breakouts`);
        } catch (error) {
            console.log('Expected auth error:', error.response?.status, error.response?.data);
        }

        // 4. Test breakouts endpoint with auth
        console.log('\n4. Testing breakouts endpoint with auth...');
        try {
            const breakoutsResponse = await axios.get(`${API_URL}/analysis/breakouts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Breakouts response:', breakoutsResponse.data);
        } catch (error) {
            console.error('Breakouts request failed:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                stack: error.stack
            });
        }

        // 5. Test database view directly
        console.log('\n5. Testing database connection...');
        const pg = await import('pg');
        const pool = new pg.Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'sp500_analysis',
            password: '1215',
            port: 5432,
        });

        const client = await pool.connect();
        try {
            const viewData = await client.query('SELECT COUNT(*) FROM vw_potential_breakouts');
            console.log('View record count:', viewData.rows[0].count);
            
            const sampleData = await client.query('SELECT * FROM vw_potential_breakouts LIMIT 1');
            console.log('Sample view data:', sampleData.rows[0]);
        } catch (error) {
            console.error('Database query failed:', error);
        } finally {
            client.release();
            await pool.end();
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testEndpoints()
    .then(() => {
        console.log('\nTest completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('\nTest failed:', error);
        process.exit(1);
    });
