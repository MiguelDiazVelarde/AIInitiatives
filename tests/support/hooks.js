const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

setDefaultTimeout(30 * 1000); // Reducido de 60s a 30s

Before(async function () {
  this.browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false',
    args: ['--no-sandbox', '--disable-dev-shm-usage'] // Optimizaciones para CI
  });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
});

After(async function () {
  if (this.context) {
    await this.context.close();
  }
  if (this.browser) {
    await this.browser.close();
  }
});