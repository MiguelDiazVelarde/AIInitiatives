const { spawn, exec } = require('child_process');
const http = require('http');

console.log('🚀 Starting test execution with server...');

// Function to check if server is ready
function checkServerReady(attempt = 1, maxAttempts = 30) {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000/', (res) => {
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
        console.log('🔧 Starting backend server...');
        serverProcess = spawn('npm', ['start'], {
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true
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
                shell: true
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
        if (serverProcess) {
            console.log('🧹 Cleaning up server...');
            serverProcess.kill('SIGTERM');
            console.log('✅ Server stopped successfully');
        }
    }
}

runTestsWithServer();