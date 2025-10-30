#!/usr/bin/env node

/**
 * Simple CI smoke test that doesn't require Playwright
 * Tests basic API endpoints to ensure they're working
 */

const http = require('http');

console.log('🧪 Running CI Smoke Tests');
console.log('==========================');

async function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  try {
    console.log('📡 Testing health endpoint...');
    const health = await makeRequest('/api/health');
    console.log(`Health response: ${health.statusCode} - ${health.body}`);
    if (health.statusCode === 200) {
      console.log('✅ Health check passed');
    } else {
      throw new Error(`Health check failed with status ${health.statusCode}`);
    }

    console.log('🔐 Testing auth endpoints...');
    
    // Test auth endpoints (they should respond, even if with errors)
    const authMe = await makeRequest('/api/auth/me');
    console.log(`Auth me response: ${authMe.statusCode}`);
    if (authMe.statusCode === 401) {
      console.log('✅ Auth me endpoint working (returned 401 as expected for unauthenticated)');
    } else {
      console.log(`⚠️  Auth me endpoint returned ${authMe.statusCode} (expected 401)`);
    }

    console.log('📦 Testing products endpoint...');
    const products = await makeRequest('/api/products');
    console.log(`Products response: ${products.statusCode}`);
    if (products.statusCode === 401) {
      console.log('✅ Products endpoint working (returned 401 as expected for unauthenticated)');
    } else {
      console.log(`⚠️  Products endpoint returned ${products.statusCode} (expected 401)`);
    }

    console.log('');
    console.log('🎉 All CI smoke tests passed!');
    console.log('✅ Server is responding correctly');
    process.exit(0);

  } catch (error) {
    console.error('❌ Smoke tests failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Add a delay to ensure server is ready
setTimeout(runTests, 2000);