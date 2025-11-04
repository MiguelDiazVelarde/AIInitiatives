const { spawn } = require('child_process');
const http = require('http');

const TEST_PORT = process.env.PORT || 3001;
const SERVER_URL = process.env.TEST_BASE_URL || `http://localhost:${TEST_PORT}`;

console.log(`🚀 Quick CI test on port ${TEST_PORT}...`);

async function quickTest() {
    let serverProcess = null;

    try {
        // Start server
        console.log(`🔧 Starting server...`);
        serverProcess = spawn('npm', ['start'], {
            stdio: ['ignore', 'inherit', 'inherit'],
            shell: true,
            env: { 
                ...process.env, 
                PORT: TEST_PORT,
                NODE_ENV: 'test'
            }
        });

        // Quick wait
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Quick health check
        console.log('🔍 Quick health check...');
        const healthCheck = await new Promise((resolve) => {
            const req = http.get(`${SERVER_URL}/api/health`, (res) => {
                resolve(res.statusCode === 200);
            });
            req.setTimeout(3000);
            req.on('error', () => resolve(false));
        });

        if (!healthCheck) {
            throw new Error('Health check failed');
        }

        console.log('✅ Server is ready!');
        
        // Run only essential auth test (fastest subset)
        console.log('🧪 Running essential auth tests...');
        const testResult = await new Promise((resolve) => {
            const testProcess = spawn('npm', ['run', 'test:auth'], {
                stdio: 'inherit',
                shell: true,
                env: { 
                    ...process.env, 
                    TEST_BASE_URL: SERVER_URL,
                    NODE_ENV: 'test',
                    HEADLESS: 'true'
                },
                timeout: 120000 // 2 minutes max
            });

            testProcess.on('close', (code) => resolve(code));
            
            // Force timeout after 2 minutes
            setTimeout(() => {
                testProcess.kill('SIGKILL');
                resolve(1);
            }, 120000);
        });

        if (testResult === 0) {
            console.log('✅ Quick tests passed!');
            process.exit(0);
        } else {
            console.log('❌ Quick tests failed');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (serverProcess && !serverProcess.killed) {
            console.log('🧹 Cleaning up...');
            serverProcess.kill('SIGKILL');
        }
    }
}

quickTest();