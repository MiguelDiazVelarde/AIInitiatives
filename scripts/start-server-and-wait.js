#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 3001;
const MAX_WAIT_TIME = 120000; // 2 minutes
const CHECK_INTERVAL = 2000; // 2 seconds

console.log(`🚀 Starting server on port ${PORT}...`);

// Start the server
const serverProcess = spawn('node', ['dist/server/index.js'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'test',
        PORT: PORT
    }
});

// Handle server process events
serverProcess.on('error', (err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    if (code !== 0) {
        console.error(`❌ Server process exited with code ${code}`);
        process.exit(1);
    }
});

// Function to check if server is ready
async function checkServerHealth() {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve({ ready: true, status: res.statusCode });
                } else {
                    resolve({ ready: false, status: res.statusCode });
                }
            });
        });
        
        req.setTimeout(3000);
        req.on('timeout', () => {
            req.destroy();
            resolve({ ready: false, error: 'timeout' });
        });
        req.on('error', (err) => {
            resolve({ ready: false, error: err.message });
        });
    });
}

// Wait for server to be ready
async function waitForServer() {
    const startTime = Date.now();
    let attempts = 0;
    
    while (Date.now() - startTime < MAX_WAIT_TIME) {
        attempts++;
        
        try {
            const health = await checkServerHealth();
            
            if (health.ready) {
                console.log(`✅ Server is ready! (attempt ${attempts}, ${Date.now() - startTime}ms)`);
                
                // Verify homepage is also accessible
                const homepageCheck = await new Promise((resolve) => {
                    const req = http.get(`http://localhost:${PORT}/`, (res) => {
                        resolve({ status: res.statusCode });
                    });
                    req.setTimeout(3000);
                    req.on('timeout', () => {
                        req.destroy();
                        resolve({ error: 'timeout' });
                    });
                    req.on('error', () => resolve({ error: 'connection_error' }));
                });
                
                if (homepageCheck.status >= 200 && homepageCheck.status < 400) {
                    console.log(`✅ Homepage accessible (status: ${homepageCheck.status})`);
                    console.log(`🎯 Server fully ready for testing!`);
                    
                    // Keep the process alive for CI
                    process.stdin.resume();
                    return;
                } else {
                    console.log(`⚠️ Homepage check failed: ${homepageCheck.error || homepageCheck.status}`);
                }
            } else {
                if (attempts % 10 === 0) { // Log every 20 seconds
                    console.log(`⏳ Waiting for server... attempt ${attempts} (${health.error || health.status})`);
                }
            }
        } catch (error) {
            if (attempts % 10 === 0) {
                console.log(`⏳ Server check error: ${error.message}`);
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
    
    console.error(`❌ Server failed to start within ${MAX_WAIT_TIME / 1000} seconds`);
    serverProcess.kill();
    process.exit(1);
}

// Cleanup on exit
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Server terminated');
    serverProcess.kill();
    process.exit(0);
});

// Start waiting for server
waitForServer().catch((error) => {
    console.error('❌ Error waiting for server:', error.message);
    serverProcess.kill();
    process.exit(1);
});