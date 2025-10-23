const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

setDefaultTimeout(60 * 1000);

Before(async function () {
  this.browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false'
  });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.baseURL = 'http://localhost:3000';
});

After(async function () {
  if (this.context) {
    await this.context.close();
  }
  if (this.browser) {
    await this.browser.close();
  }
});