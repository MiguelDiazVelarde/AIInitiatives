const { spawn, exec } = require('child_process');
const http = require('http');

const TEST_PORT = process.env.PORT || 3001; // Puerto configurable desde ENV
const SERVER_URL = process.env.TEST_BASE_URL || `http://localhost:${TEST_PORT}`;

console.log(`🚀 Starting test execution with server on port ${TEST_PORT}...`);
console.log(`📍 Test URL: ${SERVER_URL}`);

// Function to check if server is ready
function checkServerReady(attempt = 1, maxAttempts = 30) {
    return new Promise((resolve, reject) => {
        const req = http.get(`${SERVER_URL}/api/health`, (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Server is ready!');
                resolve(true);
            } else {
                if (attempt < maxAttempts) {
                    console.log(`⏳ Server not ready yet, attempt ${attempt}/${maxAttempts}...`);
                    setTimeout(() => {
                        checkServerReady(attempt + 1, maxAttempts).then(resolve).catch(reject);
                    }, 2000);
                } else {
                    reject(new Error('Server failed to start'));
                }
            }
        });

        req.on('error', () => {
            if (attempt < maxAttempts) {
                console.log(`⏳ Server not ready yet, attempt ${attempt}/${maxAttempts}...`);
                setTimeout(() => {
                    checkServerReady(attempt + 1, maxAttempts).then(resolve).catch(reject);
                }, 2000);
            } else {
                reject(new Error('Server failed to start'));
            }
        });
    });
}

// Build if needed
async function buildIfNeeded() {
    const fs = require('fs');
    if (!fs.existsSync('dist')) {
        console.log('📦 Building project first...');
        return new Promise((resolve, reject) => {
            exec('npm run build', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Build failed!', error);
                    reject(error);
                } else {
                    console.log('✅ Build completed');
                    resolve();
                }
            });
        });
    }
}

// Main function
async function runTestsWithServer() {
    let serverProcess = null;

    try {
        // Build if needed
        await buildIfNeeded();

        // Start server
        console.log(`🔧 Starting backend server on port ${TEST_PORT}...`);
        serverProcess = spawn('npm', ['start'], {
            stdio: ['ignore', 'inherit', 'inherit'],
            shell: true,
            env: { 
                ...process.env, 
                PORT: TEST_PORT,
                NODE_ENV: 'test'
            },
            detached: false
        });

        // Handle server process events
        serverProcess.on('error', (err) => {
            console.error('❌ Server process error:', err);
        });

        serverProcess.on('exit', (code, signal) => {
            console.log(`🔄 Server process exited with code ${code}, signal ${signal}`);
        });

        // Give server time to start
        console.log('⏳ Waiting for server to start...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Wait for server to be ready
        await checkServerReady();

        // Run tests
        console.log('🧪 Running authentication tests...');
        const testResult = await new Promise((resolve) => {
            const testProcess = spawn('npm', ['run', 'test:auth'], {
                stdio: 'inherit',
                shell: true,
                env: { 
                    ...process.env, 
                    TEST_BASE_URL: SERVER_URL,
                    NODE_ENV: process.env.NODE_ENV || 'test'
                }
            });

            testProcess.on('close', (code) => {
                resolve(code);
            });
        });

        // Report results
        if (testResult === 0) {
            console.log('✅ All tests passed!');
            process.exit(0);
        } else {
            console.log(`❌ Tests failed with exit code ${testResult}`);
            process.exit(testResult);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        // Cleanup
        if (serverProcess && !serverProcess.killed) {
            console.log('🧹 Cleaning up server...');
            try {
                // Try graceful shutdown first
                serverProcess.kill('SIGTERM');
                
                // Wait a bit for graceful shutdown
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Force kill if still running
                if (!serverProcess.killed) {
                    serverProcess.kill('SIGKILL');
                }
                
                console.log('✅ Server stopped successfully');
            } catch (killError) {
                console.log('⚠️ Error stopping server:', killError.message);
            }
        }
    }
}

runTestsWithServer();