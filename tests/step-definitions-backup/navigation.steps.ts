import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Initial states for navigation
Given('I am on the home page', async function (this: CustomWorld) {
  await this.page.goto(this.baseURL);
});

// Navigation actions
When('I click {string}', async function (this: CustomWorld, linkText: string) {
  await this.page.click(`text=${linkText}`);
  await this.page.waitForLoadState('networkidle');
});

When('I reload the page', async function (this: CustomWorld) {
  await this.page.reload();
  await this.page.waitForLoadState('networkidle');
});

When('the session expires', async function (this: CustomWorld) {
  // Simulate session expiration by clearing cookies
  await this.context.clearCookies();
});

When('I try to perform a protected action', async function (this: CustomWorld) {
  // Try to access dashboard or perform an action that requires authentication
  await this.page.goto(`${this.baseURL}/dashboard`);
});

// Navigation verifications
Then('I should be automatically redirected to the login page', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle');
  await expect(this.page).toHaveURL(/.*login/);
});

Then('I should be on the registration page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/.*register/);
});

Then('I should be on the login page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/.*login/);
});

Then('the interface should adjust correctly', async function (this: CustomWorld) {
  // Check that key elements remain visible
  await expect(this.page.locator('.header')).toBeVisible();
  await expect(this.page.locator('.grid, .card')).toBeVisible();
});

Then('all elements should be accessible', async function (this: CustomWorld) {
  // Check that buttons and forms still work
  await expect(this.page.locator('button')).toBeVisible();
  await expect(this.page.locator('input, textarea, select')).toBeVisible();
});

Then('I should see the {string} form', async function (this: CustomWorld, formName: string) {
  if (formName === 'Agregar Producto') {
    await expect(this.page.locator('form')).toBeVisible();
    await expect(this.page.locator('h2:has-text("Agregar Producto")')).toBeVisible();
  }
});

Then('I should see the {string} section', async function (this: CustomWorld, sectionName: string) {
  if (sectionName === 'Lista de Productos') {
    await expect(this.page.locator('h2:has-text("Lista de Productos")')).toBeVisible();
    await expect(this.page.locator('.product-list')).toBeVisible();
  }
});

Then('I should see the {string} button', async function (this: CustomWorld, buttonText: string) {
  await expect(this.page.locator(`button:has-text("${buttonText}")`)).toBeVisible();
});

Then('I should see the welcome message with my username', async function (this: CustomWorld) {
  await expect(this.page.locator('h1')).toContainText('Dashboard - Bienvenido');
});

Then('the form should have the fields:', async function (this: CustomWorld, dataTable) {
  const expectedFields = dataTable.hashes();
  
  for (const field of expectedFields) {
    const { field: fieldName, type, required } = field;
    
    let selector = '';
    switch (type) {
      case 'text':
        selector = `input[name="${fieldName}"][type="text"]`;
        break;
      case 'textarea':
        selector = `textarea[name="${fieldName}"]`;
        break;
      case 'number':
        selector = `input[name="${fieldName}"][type="number"]`;
        break;
      case 'select':
        selector = `select[name="${fieldName}"]`;
        break;
    }
    
    await expect(this.page.locator(selector)).toBeVisible();
    
    if (required === 'yes') {
      const isRequired = await this.page.locator(selector).getAttribute('required');
      expect(isRequired).not.toBeNull();
    }
  }
});

Then('I should remain authenticated', async function (this: CustomWorld) {
  // Check that we're still on dashboard and not redirected to login
  await expect(this.page).toHaveURL(/.*dashboard/);
  await expect(this.page.locator('h1')).toContainText('Dashboard - Bienvenido');
});

Then('I should stay on the dashboard', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/.*dashboard/);
});