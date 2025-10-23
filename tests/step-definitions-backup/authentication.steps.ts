import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Background
Given('the application is running at {string}', async function (this: CustomWorld, url: string) {
  this.baseURL = url;
  await this.page.goto(url);
});

Given('I am on the login page', async function (this: CustomWorld) {
  await this.navigateToLogin();
});

Given('I am on the registration page', async function (this: CustomWorld) {
  await this.navigateToRegister();
});

Given('I am authenticated as {string}', async function (this: CustomWorld, username: string) {
  await this.login(username, 'password');
});

Given('I am not authenticated', async function (this: CustomWorld) {
  await this.clearSessionData();
});

// Login actions
When('I enter username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  await this.page.fill('input[name="username"]', username);
  await this.page.fill('input[name="password"]', password);
});

When('I click the {string} button', async function (this: CustomWorld, buttonText: string) {
  await this.page.click(`button:has-text("${buttonText}")`);
  await this.page.waitForLoadState('networkidle');
});

// Registration actions
When('I enter the user data:', async function (this: CustomWorld, dataTable) {
  const data = dataTable.rowsHash();
  
  if (data.username) {
    await this.page.fill('input[name="username"]', data.username);
  }
  if (data.email) {
    await this.page.fill('input[name="email"]', data.email);
  }
  if (data.password) {
    await this.page.fill('input[name="password"]', data.password);
  }
});

// Direct dashboard access
When('I try to access the dashboard directly', async function (this: CustomWorld) {
  await this.page.goto(`${this.baseURL}/dashboard`);
});

// Verifications
Then('I should be redirected to the dashboard', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/.*dashboard/);
});

Then('I should be redirected to the login page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/.*login/);
});

Then('I should see the message {string}', async function (this: CustomWorld, message: string) {
  await expect(this.page.locator('body')).toContainText(message);
});

Then('I should see an error message {string}', async function (this: CustomWorld, errorMessage: string) {
  // For API JSON errors
  const bodyText = await this.page.textContent('body');
  if (bodyText?.includes('error')) {
    expect(bodyText).toContain(errorMessage);
  } else {
    // For UI errors
    await expect(this.page.locator('.error, .alert-danger')).toContainText(errorMessage);
  }
});

Then('I should not have access to the dashboard', async function (this: CustomWorld) {
  await this.page.goto(`${this.baseURL}/dashboard`);
  // Should be redirected or see authentication error
  const currentUrl = this.page.url();
  const bodyText = await this.page.textContent('body');
  
  const isRedirectedToLogin = currentUrl.includes('login');
  const hasAuthError = bodyText?.includes('Acceso no autorizado') || bodyText?.includes('error');
  
  expect(isRedirectedToLogin || hasAuthError).toBeTruthy();
});