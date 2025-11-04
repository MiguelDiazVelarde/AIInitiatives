const http = require('http');

const TEST_PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

console.log(`🧪 Running API tests on ${BASE_URL}...`);

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
            
            const result = await new Promise((resolve) => {
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
                
                req.setTimeout(5000);
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
                console.log(`❌ ${test.name}: Expected ${test.expectedStatus}, got ${result.statusCode}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: Test error - ${error.message}`);
        }
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