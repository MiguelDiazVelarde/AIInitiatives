#!/usr/bin/env node

/**
 * Simple health check for CI that just verifies the server starts correctly
 * Does not require Playwright or complex testing frameworks
 */

const http = require('http');

console.log('🔍 CI Health Check');
console.log('===================');

function healthCheck() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/api/health', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Server health check passed');
          console.log(`Response: ${data}`);
          resolve(true);
        } else {
          reject(new Error(`Health check failed with status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });
  });
}

async function waitForServer(maxAttempts = 15) {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      console.log(`Attempt ${i}/${maxAttempts}: Checking server health...`);
      await healthCheck();
      return true;
    } catch (error) {
      console.log(`❌ Attempt ${i} failed: ${error.message}`);
      if (i < maxAttempts) {
        console.log('⏳ Waiting 2 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  throw new Error('Server failed to become healthy within expected time');
}

async function runCheck() {
  try {
    await waitForServer();
    console.log('');
    console.log('🎉 CI Health Check Passed!');
    console.log('✅ Server is running and responding correctly');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ CI Health Check Failed:');
    console.error(error.message);
    process.exit(1);
  }
}

runCheck();