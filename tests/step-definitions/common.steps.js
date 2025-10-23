const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Background
Given('the application is running at {string}', async function (url) {
  this.baseURL = url;
  await this.page.goto(url);
});

Given('I am on the login page', async function () {
  await this.page.goto(`${this.baseURL}/auth/login`);
  await this.page.waitForLoadState('networkidle');
});

// Actions
When('I enter username {string} and password {string}', async function (username, password) {
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
});

When('I navigate to the main page', async function () {
  await this.page.goto(this.baseURL);
  await this.page.waitForLoadState('networkidle');
});

// Verifications
Then('I should be redirected to the dashboard', async function () {
  await expect(this.page).toHaveURL(/.*dashboard/);
});

Then('I should be redirected to the login page', async function () {
  await expect(this.page).toHaveURL(/.*login/);
});