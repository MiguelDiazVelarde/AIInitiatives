#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Starting Smoke Test Suite');
console.log('============================');

let serverProcess = null;

// Function to kill server process
function killServer() {
  if (serverProcess) {
    console.log('🛑 Stopping test server...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

// Function to wait for server to be ready
async function waitForServer(maxRetries = 15) {
  const http = require('http');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000/api/health', (res) => {
          if (res.statusCode === 200) {
            console.log('✅ Test server is ready!');
            resolve();
          } else {
            reject(new Error(`Server responded with status: ${res.statusCode}`));
          }
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        req.setTimeout(2000, () => {
          req.abort();
          reject(new Error('Request timeout'));
        });
      });
      
      return true;
    } catch (error) {
      console.log(`⏳ Waiting for server... attempt ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// Function to run tests
function runTests() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Running smoke tests...');
    
    const testProcess = spawn('npm', ['run', 'test:smoke'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ All tests passed!');
        resolve();
      } else {
        console.log(`❌ Tests failed with exit code: ${code}`);
        reject(new Error(`Tests failed with exit code: ${code}`));
      }
    });

    testProcess.on('error', (error) => {
      console.error('❌ Error running tests:', error);
      reject(error);
    });
  });
}

// Main execution
async function main() {
  try {
    // Step 1: Build the project
    console.log('🔨 Building project...');
    await new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
      });

      buildProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Build completed!');
          resolve();
        } else {
          reject(new Error(`Build failed with exit code: ${code}`));
        }
      });
    });

    // Step 2: Start test server
    console.log('🚀 Starting test server...');
    serverProcess = spawn('npm', ['run', 'start:test'], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    // Listen for server output
    serverProcess.stdout.on('data', (data) => {
      console.log(`[SERVER] ${data.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[SERVER ERROR] ${data.toString().trim()}`);
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });

    // Step 3: Wait for server to be ready
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Initial wait
    
    const serverReady = await waitForServer();
    if (!serverReady) {
      throw new Error('Server failed to start within timeout period');
    }

    // Step 4: Run tests
    await runTests();

    console.log('🎉 Smoke test suite completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Smoke test suite failed:', error.message);
    process.exit(1);
  } finally {
    killServer();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  killServer();
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  killServer();
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  killServer();
  process.exit(1);
});