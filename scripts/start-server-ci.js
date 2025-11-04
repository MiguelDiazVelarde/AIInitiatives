const { spawn } = require('child_process');
const http = require('http');

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'test';
const MAX_ATTEMPTS = 60;

console.log(`🚀 Starting server on port ${PORT} in ${NODE_ENV} mode...`);

// Start server
const server = spawn('node', ['dist/server/index.js'], {
    env: { ...process.env, PORT, NODE_ENV },
    stdio: 'inherit'
});

let attempt = 0;
let serverReady = false;

// Cleanup function
function cleanup() {
    console.log('\n🛑 Cleaning up server...');
    server.kill();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

console.log(`Server started with PID: ${server.pid}`);

// Health check function
async function checkHealth() {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
            resolve({ ready: res.statusCode === 200, status: res.statusCode });
        });
        req.setTimeout(3000);
        req.on('timeout', () => {
            req.destroy();
            resolve({ ready: false, error: 'timeout' });
        });
        req.on('error', () => resolve({ ready: false, error: 'connection' }));
    });
}

// Wait for server
async function waitForServer() {
    console.log('Waiting for server to be ready...');
    
    while (attempt < MAX_ATTEMPTS && !serverReady) {
        attempt++;
        
        const health = await checkHealth();
        
        if (health.ready) {
            console.log(`✅ Server ready on attempt ${attempt}!`);
            
            // Double check homepage
            const homepage = await new Promise((resolve) => {
                const req = http.get(`http://localhost:${PORT}/`, (res) => {
                    resolve({ ready: res.statusCode < 400, status: res.statusCode });
                });
                req.setTimeout(3000);
                req.on('timeout', () => {
                    req.destroy();
                    resolve({ ready: false, error: 'timeout' });
                });
                req.on('error', () => resolve({ ready: false, error: 'connection' }));
            });
            
            if (homepage.ready) {
                console.log(`✅ Homepage accessible (${homepage.status})`);
                console.log(`🎯 Server fully ready for testing!`);
                serverReady = true;
                
                // Keep process alive
                process.stdin.resume();
                return;
            }
        }
        
        if (attempt % 10 === 0) {
            console.log(`⏳ Still waiting... attempt ${attempt}/${MAX_ATTEMPTS}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (!serverReady) {
        console.error(`❌ Server failed to start after ${MAX_ATTEMPTS} attempts`);
        process.exit(1);
    }
}

server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
    process.exit(1);
});

server.on('exit', (code) => {
    if (code !== 0 && !serverReady) {
        console.error(`❌ Server exited with code ${code}`);
        process.exit(1);
    }
});

waitForServer().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});