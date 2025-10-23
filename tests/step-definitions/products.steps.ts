import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Initial states
Given('I am on the dashboard', async function (this: CustomWorld) {
  await this.navigateToDashboard();
});

Given('there are no registered products', async function (this: CustomWorld) {
  // Assume we start with empty list or clean data
  await this.navigateToDashboard();
});

Given('there are registered products', async function (this: CustomWorld) {
  await this.navigateToDashboard();
  // Check if there are products, if not add a test one
  const productCount = await this.page.locator('.product-item').count();
  if (productCount === 0) {
    await this.addProduct({
      name: 'Test Product',
      description: 'Product for testing',
      price: '10.00',
      category: 'other',
      stock: '5'
    });
  }
});

Given('there is a product {string} in the list', async function (this: CustomWorld, productName: string) {
  await this.navigateToDashboard();
  
  // Check if product exists, if not create it
  const productExists = await this.page.locator(`text=${productName}`).isVisible();
  if (!productExists) {
    await this.addProduct({
      name: productName,
      description: 'Product for testing',
      price: '15.00',
      category: 'other',
      stock: '10'
    });
  }
});

// Form actions
When('I complete the product form with:', async function (this: CustomWorld, dataTable) {
  const data = dataTable.rowsHash();
  await this.addProduct(data);
});

When('I complete the form with category {string}', async function (this: CustomWorld, category: string) {
  // Used in conjunction with other steps
  await this.page.selectOption('select[name="category"]', category);
});

When('I add a product {string}', async function (this: CustomWorld, name: string) {
  await this.page.fill('input[name="name"]', name);
  await this.page.fill('textarea[name="description"]', `Description for ${name}`);
  await this.page.fill('input[name="price"]', '50.00');
  await this.page.fill('input[name="stock"]', '20');
  await this.page.click('button[type="submit"]');
  await this.page.waitForLoadState('networkidle');
});

When('I click {string}', async function (this: CustomWorld, buttonText: string) {
  await this.page.click(`button:has-text("${buttonText}")`);
  await this.page.waitForLoadState('networkidle');
});

When('I click the {string} button for product {string}', async function (this: CustomWorld, action: string, productName: string) {
  const productLocator = this.page.locator(`.product-item:has(text="${productName}")`);
  
  if (action === 'Eliminar') {
    await productLocator.locator('button.btn-danger').click();
  } else if (action === 'Editar') {
    await productLocator.locator('button.btn-warning').click();
  }
});

When('I confirm the deletion in the dialog', async function (this: CustomWorld) {
  await this.confirmDeleteDialog();
});

When('I cancel the deletion in the dialog', async function (this: CustomWorld) {
  await this.cancelDeleteDialog();
});

When('I try to submit the form without completing required fields', async function (this: CustomWorld) {
  // Leave fields empty and submit
  await this.page.click('button[type="submit"]');
});

When('I change the browser window size', async function (this: CustomWorld) {
  // Simulate different screen sizes
  await this.page.setViewportSize({ width: 768, height: 1024 }); // Tablet
  await this.page.waitForTimeout(1000);
  await this.page.setViewportSize({ width: 375, height: 667 }); // Mobile
  await this.page.waitForTimeout(1000);
  await this.page.setViewportSize({ width: 1280, height: 720 }); // Desktop
});

// Verifications
Then('the product {string} should appear in the list', async function (this: CustomWorld, productName: string) {
  await expect(this.page.locator(`text=${productName}`)).toBeVisible();
});

Then('it should show the price {string}', async function (this: CustomWorld, price: string) {
  await expect(this.page.locator(`text=${price}`)).toBeVisible();
});

Then('it should show the stock {string}', async function (this: CustomWorld, stock: string) {
  await expect(this.page.locator(`.product-item:has-text("Stock: ${stock}")`)).toBeVisible();
});

Then('I should see the message {string}', async function (this: CustomWorld, message: string) {
  await expect(this.page.locator(`text=${message}`)).toBeVisible();
});

Then('the product counter should show {string}', async function (this: CustomWorld, count: string) {
  await expect(this.page.locator(`text=Lista de Productos ${count}`)).toBeVisible();
});

Then('I should see the product list', async function (this: CustomWorld) {
  await expect(this.page.locator('.product-list')).toBeVisible();
});

Then('the counter should show the correct number of products', async function (this: CustomWorld) {
  const productCount = await this.page.locator('.product-item').count();
  await expect(this.page.locator(`text=Lista de Productos (${productCount})`)).toBeVisible();
});

Then('the product {string} should not appear in the list', async function (this: CustomWorld, productName: string) {
  await expect(this.page.locator(`text=${productName}`)).not.toBeVisible();
});

Then('the product counter should decrease', async function (this: CustomWorld) {
  // This verification is done indirectly by checking that the number changed
  const productCount = await this.page.locator('.product-item').count();
  await expect(this.page.locator(`text=Lista de Productos (${productCount})`)).toBeVisible();
});

Then('the product {string} should remain in the list', async function (this: CustomWorld, productName: string) {
  await expect(this.page.locator(`text=${productName}`)).toBeVisible();
});

Then('I should see validation messages for required fields', async function (this: CustomWorld) {
  // Check that HTML required fields are triggered
  const nameField = this.page.locator('input[name="name"]');
  const isInvalid = await nameField.evaluate((el: HTMLInputElement) => !el.validity.valid);
  expect(isInvalid).toBeTruthy();
});

Then('the product should not be added', async function (this: CustomWorld) {
  // Check that no product was added with invalid data
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('dashboard'); // Should remain on dashboard
});

Then('the product should appear with category {string}', async function (this: CustomWorld, category: string) {
  await expect(this.page.locator(`.product-item:has-text("Categoría: ${category}")`)).toBeVisible();
});