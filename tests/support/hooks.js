const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

setDefaultTimeout(30 * 1000); // Reducido de 60s a 30s

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
    this.browser = await chromium.launch(launchOptions);
    
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