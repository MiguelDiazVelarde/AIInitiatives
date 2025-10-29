const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Background
Given('the application is running at {string}', async function (url) {
  this.baseURL = url;
  await this.page.goto(url);
});

Given('I am on the login page', async function () {
  await this.page.goto(`${this.baseURL}/auth`);
  await this.page.waitForLoadState('networkidle');
});

// Actions
When('I enter username {string} and password {string}', async function (username, password) {
  // Wait for form to be visible
  await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await this.page.fill('input[name="username"]', username);
  await this.page.fill('input[name="password"]', password);
});

When('I click the {string} button', async function (buttonText) {
  if (buttonText === 'Login') {
    await this.page.click('button[type="submit"]');
  } else {
    await this.page.click(`button:has-text("${buttonText}")`);
  }
  await this.page.waitForLoadState('networkidle');
  // Add extra wait for React navigation
  await this.page.waitForTimeout(1000);
});

When('I navigate to the main page', async function () {
  await this.page.goto(this.baseURL);
  await this.page.waitForLoadState('networkidle');
  // Wait for React app to load and potentially redirect
  await this.page.waitForTimeout(2000);
});

// Verifications
Then('I should be redirected to the dashboard', async function () {
  await expect(this.page).toHaveURL(/.*dashboard/, { timeout: 10000 });
});

Then('I should be redirected to the login page', async function () {
  await expect(this.page).toHaveURL(/.*auth/, { timeout: 10000 });
});