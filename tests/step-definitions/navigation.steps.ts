import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// Navigation actions
When('I navigate to the main page', async function () {
  await this.page.goto(this.baseURL);
  await this.page.waitForLoadState('networkidle');
  // Wait for React app to load and potentially redirect
  await this.page.waitForTimeout(2000);
});

When('I am on the dashboard', async function () {
  await this.page.goto(`${this.baseURL}/dashboard`);
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
});

When('I change the browser window size', async function () {
  // Test mobile size
  await this.page.setViewportSize({ width: 375, height: 667 });
  await this.page.waitForTimeout(1000);
  
  // Test desktop size
  await this.page.setViewportSize({ width: 1200, height: 800 });
  await this.page.waitForTimeout(1000);
});

When('I reload the page', async function () {
  await this.page.reload();
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
});

When('the session expires', async function () {
  // Simulate session expiration by clearing session storage
  await this.page.evaluate(() => {
    (globalThis as any).localStorage.clear();
    (globalThis as any).sessionStorage.clear();
    
    // Also clear any cookies
    const cookies = (globalThis as any).document.cookie.split(";");
    for (const c of cookies) { 
      (globalThis as any).document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    }
  });
});

When('I try to perform a protected action', async function () {
  // Try to access dashboard or perform an action that requires authentication
  await this.page.goto(`${this.baseURL}/dashboard`);
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
});

// Verifications
Then('the interface should adjust correctly', async function () {
  // Check that elements are still visible and properly arranged
  const header = this.page.locator('h1, h2').first();
  await expect(header).toBeVisible();
  
  // Check that forms are accessible
  const form = this.page.locator('form').first();
  if (await form.count() > 0) {
    await expect(form).toBeVisible();
  }
});

Then('all elements should be accessible', async function () {
  // Basic accessibility check
  const buttons = this.page.locator('button');
  const buttonCount = await buttons.count();
  
  for (let i = 0; i < buttonCount; i++) {
    await expect(buttons.nth(i)).toBeVisible();
  }
  
  const inputs = this.page.locator('input');
  const inputCount = await inputs.count();
  
  for (let i = 0; i < inputCount; i++) {
    await expect(inputs.nth(i)).toBeVisible();
  }
});

Then('I should see the {string} form', async function (formName: string) {
  if (formName.includes('Add Product') || formName.includes('Agregar Producto')) {
    await expect(this.page.locator('form')).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator('input[name="name"]')).toBeVisible();
  }
});

Then('I should see the {string} section', async function (sectionName: string) {
  if (sectionName.includes('Product List') || sectionName.includes('Lista de Productos')) {
    // Look for product list section
    await expect(this.page.locator('text*="Productos"')).toBeVisible({ timeout: 5000 });
  }
});

Then('I should see the {string} button', async function (buttonText: string) {
  if (buttonText === 'Logout') {
    await expect(this.page.locator(`button:has-text("Cerrar Sesión")`)).toBeVisible({ timeout: 5000 });
  } else {
    await expect(this.page.locator(`button:has-text("${buttonText}")`)).toBeVisible({ timeout: 5000 });
  }
});

Then('I should see the welcome message with my username', async function () {
  // Look for any text that contains "admin" or welcome message
  await expect(this.page.locator('text*="admin"')).toBeVisible({ timeout: 5000 });
});

Then('the form should have the fields:', async function (dataTable: any) {
  const fields = dataTable.hashes();
  
  for (const field of fields) {
    const fieldName = field.field;
    const fieldType = field.type;
    const isRequired = field.required === 'yes';
    
    if (fieldType === 'text' || fieldType === 'number') {
      const input = this.page.locator(`input[name="${fieldName}"]`);
      await expect(input).toBeVisible();
      
      if (isRequired) {
        await expect(input).toHaveAttribute('required');
      }
    } else if (fieldType === 'textarea') {
      const textarea = this.page.locator(`textarea[name="${fieldName}"]`);
      await expect(textarea).toBeVisible();
      
      if (isRequired) {
        await expect(textarea).toHaveAttribute('required');
      }
    } else if (fieldType === 'select') {
      const select = this.page.locator(`select[name="${fieldName}"]`);
      await expect(select).toBeVisible();
      
      if (isRequired) {
        await expect(select).toHaveAttribute('required');
      }
    }
  }
});

Then('I should remain authenticated', async function () {
  // Should stay on dashboard or be able to access protected content
  const currentUrl = this.page.url();
  expect(currentUrl).toMatch(/dashboard|admin/);
});

Then('I should stay on the dashboard', async function () {
  await expect(this.page).toHaveURL(/.*dashboard/, { timeout: 5000 });
});