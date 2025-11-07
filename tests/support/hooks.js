const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

// Increased timeout for session persistence tests and CI environments
setDefaultTimeout(60 * 1000); // Increased to 60s for better reliability in CI

Before(async function () {
  try {
    console.log('🚀 Starting browser for test...');
    
    // Browser launch options optimized for CI
    const launchOptions = {
      headless: process.env.HEADLESS !== 'false',
      args: [
        '--no-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    };
    
    // Add specific executable path if in CI environment
    if (process.env.CI || process.env.GITHUB_ACTIONS) {
      console.log('🔧 Running in CI environment, using default browser paths...');
      // Let Playwright find the browser automatically
    }
    
    console.log('🎭 Launching Chromium browser...');
    
    // Add retry logic for browser launch
    let browser = null;
    let lastError = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔄 Browser launch attempt ${attempt}/3...`);
        browser = await chromium.launch(launchOptions);
        console.log('✅ Browser launched successfully');
        break;
      } catch (error) {
        lastError = error;
        console.error(`❌ Browser launch attempt ${attempt} failed:`, error.message);
        
        if (attempt < 3) {
          console.log('⏳ Waiting 2 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    if (!browser) {
      console.error('❌ All browser launch attempts failed');
      throw lastError;
    }
    
    this.browser = browser;
    
    console.log('📱 Creating browser context...');
    this.context = await this.browser.newContext({
      // Additional context options for better test reliability
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true
    });
    
    console.log('📄 Creating new page...');
    this.page = await this.context.newPage();
    
    this.baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
    console.log(`🌐 Base URL set to: ${this.baseURL}`);
    
  } catch (error) {
    console.error('❌ Failed to initialize browser:', error.message);
    console.error('🔍 Error details:', error);
    
    // Try to provide helpful debugging info
    if (error.message.includes("Executable doesn't exist")) {
      console.error('🚨 Browser executable not found. This usually means Playwright browsers are not installed.');
      console.error('💡 Try running: npx playwright install');
      
      // In CI, try to diagnose what browsers are available
      if (process.env.CI || process.env.GITHUB_ACTIONS) {
        console.error('🔍 Diagnosing browser installation in CI...');
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        try {
          const cacheDir = path.join(os.homedir(), '.cache', 'ms-playwright');
          console.error('🔍 Browser cache directory:', cacheDir);
          
          if (fs.existsSync(cacheDir)) {
            const contents = fs.readdirSync(cacheDir);
            console.error('📂 Available browsers:', contents);
            
            // Look for chromium specifically
            const chromiumDirs = contents.filter(dir => dir.includes('chromium'));
            if (chromiumDirs.length > 0) {
              console.error('🔍 Chromium directories found:', chromiumDirs);
              chromiumDirs.forEach(dir => {
                const fullPath = path.join(cacheDir, dir);
                try {
                  const subContents = fs.readdirSync(fullPath);
                  console.error(`📁 Contents of ${dir}:`, subContents.slice(0, 5));
                } catch (e) {
                  console.error(`❌ Failed to read ${dir}:`, e.message);
                }
              });
            }
          } else {
            console.error('❌ Browser cache directory does not exist');
          }
        } catch (e) {
          console.error('❌ Failed to diagnose browser installation:', e.message);
        }
      }
    }
    
    throw error;
  }
});

After(async function () {
  try {
    console.log('🧹 Cleaning up test resources...');
    
    if (this.context) {
      console.log('📱 Closing browser context...');
      await this.context.close();
    }
    
    if (this.browser) {
      console.log('🎭 Closing browser...');
      await this.browser.close();
    }
    
    console.log('✅ Test cleanup completed');
  } catch (error) {
    console.error('⚠️ Error during cleanup:', error.message);
    // Don't throw error during cleanup to avoid masking test failures
  }
});