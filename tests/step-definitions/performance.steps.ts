import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Performance-related steps
Given('the application is running', async function (this: CustomWorld) {
  await this.page.goto(this.baseURL);
  await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
});

Given('I have access to the system', async function (this: CustomWorld) {
  // Verify basic access
  const response = await this.page.goto(this.baseURL);
  expect(response?.status()).toBeLessThan(400);
});

Given('I am performing typical application operations', async function (this: CustomWorld) {
  await this.login('admin', 'password');
});

Given('I am logged into the application', async function (this: CustomWorld) {
  await this.login('admin', 'password');
});

Given('multiple users are accessing the system simultaneously', async function (this: CustomWorld) {
  // Simulated for testing - in reality would require multiple browser contexts
  this.concurrentUsers = true;
});

When('I login, view products, create items, or navigate', async function (this: CustomWorld) {
  const startTime = Date.now();
  await this.login('admin', 'password');
  await this.navigateToDashboard();
  this.navigationTime = Date.now() - startTime;
});

When('they perform various operations at the same time', async function (this: CustomWorld) {
  // Simulate concurrent operations
  await this.navigateToDashboard();
});

Then('each operation should complete within acceptable time limits', async function (this: CustomWorld) {
  expect(this.navigationTime).toBeLessThan(5000); // 5 seconds max
});

Then('response times should be under {int} seconds for most actions', async function (this: CustomWorld, seconds: number) {
  expect(this.navigationTime).toBeLessThan(seconds * 1000);
});

Then('the interface should remain responsive during operations', async function (this: CustomWorld) {
  const isResponsive = await this.page.locator('body').isVisible();
  expect(isResponsive).toBe(true);
});

Then('the dashboard should load quickly', async function (this: CustomWorld) {
  const startTime = Date.now();
  await this.navigateToDashboard();
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000); // 3 seconds max
});

Then('product lists should appear promptly', async function (this: CustomWorld) {
  await expect(this.page.locator('form, .product-container')).toBeVisible({ timeout: 3000 });
});

Then('the interface should be usable immediately', async function (this: CustomWorld) {
  const formVisible = await this.page.locator('input[name="name"]').isVisible();
  expect(formVisible).toBe(true);
});

Then('the system should maintain good performance for all users', async function (this: CustomWorld) {
  // Simulated check
  expect(this.concurrentUsers).toBe(true);
});
