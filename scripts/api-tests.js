const http = require('http');

const TEST_PORT = process.env.PORT || process.env.TEST_PORT || 3001;
const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${TEST_PORT}`;

console.log(`🧪 Running API tests on ${BASE_URL}...`);
console.log(`Using port: ${TEST_PORT}`);

// Initial connectivity check
console.log('🔍 Performing initial connectivity check...');

async function checkConnectivity() {
    return new Promise((resolve) => {
        const req = http.get(`${BASE_URL}/api/health`, (res) => {
            resolve({ connected: true, status: res.statusCode });
        });
        
        req.setTimeout(3000);
        req.on('timeout', () => {
            req.destroy();
            resolve({ connected: false, error: 'timeout' });
        });
        req.on('error', (err) => {
            resolve({ connected: false, error: err.message });
        });
    });
}

async function testAPI() {
    const tests = [
        {
            name: 'Health Check',
            path: '/api/health',
            expectedStatus: 200
        },
        {
            name: 'Homepage',
            path: '/',
            expectedStatus: 200
        }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
        try {
            console.log(`Testing ${test.name} (${test.path})...`);
            
            const result = await new Promise((resolve, reject) => {
                const req = http.get(`${BASE_URL}${test.path}`, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        resolve({
                            statusCode: res.statusCode,
                            data: data
                        });
                    });
                });
                
                req.setTimeout(10000); // Increased timeout to 10 seconds
                req.on('timeout', () => {
                    req.destroy();
                    resolve({ error: 'Request timeout (10s)' });
                });
                req.on('error', (err) => {
                    resolve({ error: err.message });
                });
            });

            if (result.error) {
                console.log(`❌ ${test.name}: Connection error - ${result.error}`);
            } else if (result.statusCode === test.expectedStatus) {
                console.log(`✅ ${test.name}: Success (${result.statusCode})`);
                passedTests++;
            } else {
                console.log(`❌ ${test.name}: Expected ${test.expectedStatus}, got ${result.statusCode || 'undefined'}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: Test error - ${error.message}`);
        }
        
        // Add small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n📊 API Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('✅ All API tests passed!');
        process.exit(0);
    } else {
        console.log('❌ Some API tests failed');
        process.exit(1);
    }
}

testAPI();

async function runTests() {
    // Check connectivity first
    const connectCheck = await checkConnectivity();
    if (!connectCheck.connected) {
        console.log(`❌ Cannot connect to server: ${connectCheck.error}`);
        console.log('Make sure the server is running and accessible.');
        process.exit(1);
    }
    console.log(`✅ Server is responding (status: ${connectCheck.status})`);
    
    // Run the actual tests
    await testAPI();
}

runTests().catch(error => {
    console.error('❌ Test runner error:', error.message);
    process.exit(1);
});