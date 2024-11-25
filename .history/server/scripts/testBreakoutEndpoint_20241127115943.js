import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testBreakoutEndpoint() {
    try {
        console.log('1. Testing basic endpoint...');
        const testResponse = await axios.get(`${API_URL}/analysis/test`);
        console.log('Basic test response:', testResponse.data);

        console.log('\n2. Testing breakouts test endpoint...');
        const breakoutsResponse = await axios.get(`${API_URL}/analysis/breakouts/test`);
        console.log('Breakouts test response status:', breakoutsResponse.status);
        console.log('Breakouts test response data:', JSON.stringify(breakoutsResponse.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error('Error response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error:', error.message);
        }
        console.error('Full error:', error);
    }
}

testBreakoutEndpoint()
    .then(() => {
        console.log('\nTest completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('\nTest failed:', error);
        process.exit(1);
    });
