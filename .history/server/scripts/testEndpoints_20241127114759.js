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
        console.log('1. Testing technical analysis test endpoint...');
        const testResponse = await axios.get(`${API_URL}/analysis/test`);
        console.log('Test endpoint response:', testResponse.data);

        console.log('\n2. Getting authentication token...');
        const authResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        const token = authResponse.data.token;
        console.log('Authentication successful');

        console.log('\n3. Testing breakouts endpoint with authentication...');
        const breakoutsResponse = await axios.get(`${API_URL}/analysis/breakouts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Breakouts endpoint response:', breakoutsResponse.data);

    } catch (error) {
        if (error.response) {
            console.error('Error response:', {
                status: error.response.status,
                data: error.response.data
            });
        } else {
            console.error('Error:', error.message);
        }
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
