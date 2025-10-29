import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// Background
Given('the application is running at {string}', async function (url: string) {
  this.baseURL = url;
  await this.page.goto(url);
  await this.page.waitForLoadState('networkidle');
});

Given('I am on the login page', async function () {
  await this.page.goto(`${this.baseURL}/auth`);
  await this.page.waitForLoadState('networkidle');
  // Wait for React app to load
  await this.page.waitForTimeout(2000);
});

Given('I am on the registration page', async function () {
  await this.page.goto(`${this.baseURL}/auth`);
  await this.page.waitForLoadState('networkidle');
  // Switch to registration form - try both English and Spanish
  try {
    await this.page.click('button:has-text("Register")', { timeout: 5000 });
  } catch {
    await this.page.click('button:has-text("Regístrate")');
  }
  await this.page.waitForTimeout(1000);
});

Given('I am authenticated as {string}', async function (username: string) {
  // Go to login page
  await this.page.goto(`${this.baseURL}/auth`);
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
  
  // Wait for form to be visible
  await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
  
  // Fill login form
  await this.page.fill('input[name="username"]', username);
  await this.page.fill('input[name="password"]', 'password');
  
  // Submit
  await this.page.click('button[type="submit"]');
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
  
  // Verify we're on dashboard
  await expect(this.page).toHaveURL(/.*dashboard/, { timeout: 10000 });
});

Given('I am not authenticated', async function () {
  // Clear any stored authentication data
  await this.page.evaluate(() => {
    (globalThis as any).localStorage.clear();
    (globalThis as any).sessionStorage.clear();
  });
  
  // Navigate to auth page to ensure we're logged out
  await this.page.goto(`${this.baseURL}/auth`);
  await this.page.waitForLoadState('networkidle');
});

// Login actions
When('I enter username {string} and password {string}', async function (username: string, password: string) {
  // Wait for form to be visible
  await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await this.page.fill('input[name="username"]', username);
  await this.page.fill('input[name="password"]', password);
});

When('I click the {string} button', async function (buttonText: string) {
  if (buttonText === 'Login' || buttonText === 'Iniciar Sesión') {
    await this.page.click('button[type="submit"]');
  } else if (buttonText === 'Register' || buttonText === 'Registrarse') {
    await this.page.click('button[type="submit"]');
  } else if (buttonText === 'Logout' || buttonText === 'Cerrar Sesión') {
    // Try both English and Spanish logout button text
    try {
      await this.page.click('button:has-text("Logout")', { timeout: 5000 });
    } catch {
      await this.page.click('button:has-text("Cerrar Sesión")');
    }
  } else {
    await this.page.click(`button:has-text("${buttonText}")`);
  }
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(1000);
});

When('I click the auth button {string}', async function (elementText: string) {
  if (elementText.includes('Regístrate') || elementText.includes('registro') || elementText.includes('Register')) {
    // Try different possible register button texts
    try {
      await this.page.click('button:has-text("Register")', { timeout: 5000 });
    } catch {
      try {
        await this.page.click('button:has-text("Registrarse")', { timeout: 5000 });
      } catch {
        await this.page.click('button:has-text("Regístrate")');
      }
    }
  } else if (elementText.includes('Inicia sesión') || elementText.includes('login') || elementText.includes('Login')) {
    // Try different possible login button texts
    try {
      await this.page.click('button:has-text("Login")', { timeout: 5000 });
    } catch {
      try {
        await this.page.click('button:has-text("Iniciar Sesión")', { timeout: 5000 });
      } catch {
        await this.page.click('button:has-text("Inicia sesión")');
      }
    }
  } else if (elementText.includes("Don't have an account")) {
    await this.page.click('button:has-text("Regístrate")');
  } else if (elementText.includes("Already have an account")) {
    await this.page.click('button:has-text("Inicia sesión")');
  } else {
    await this.page.click(`text="${elementText}"`);
  }
  await this.page.waitForTimeout(1000);
});

When('I submit the login form', async function () {
  await this.page.click('button[type="submit"]');
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
});

When('I submit the registration form', async function () {
  await this.page.click('button[type="submit"]');
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
});

When('I enter registration details for username {string}', async function (username: string) {
  await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await this.page.fill('input[name="username"]', username);
  await this.page.fill('input[name="password"]', 'password123');
  await this.page.fill('input[name="confirmPassword"]', 'password123');
});

When('I logout', async function () {
  await this.page.click('button:has-text("Cerrar Sesión")');
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(1000);
});

// Verifications
Then('I should be redirected to the dashboard', async function () {
  await expect(this.page).toHaveURL(/.*dashboard/, { timeout: 10000 });
});

Then('I should be redirected to the login page', async function () {
  await expect(this.page).toHaveURL(/.*auth/, { timeout: 10000 });
});

Then('I should be on the login page', async function () {
  await expect(this.page).toHaveURL(/.*auth/, { timeout: 10000 });
  // Verify login form is visible
  await expect(this.page.locator('h2:has-text("Iniciar Sesión")')).toBeVisible({ timeout: 5000 });
});

Then('I should be on the registration page', async function () {
  await expect(this.page).toHaveURL(/.*auth/, { timeout: 10000 });
  // Verify registration form is visible
  await expect(this.page.locator('h2:has-text("Registrarse")')).toBeVisible({ timeout: 5000 });
});

Then('I should see an error message', async function () {
  await expect(this.page.locator('.error')).toBeVisible({ timeout: 5000 });
});

Then('I should see a success message', async function () {
  // Could be a success message or redirect to dashboard
  try {
    await expect(this.page.locator('.success')).toBeVisible({ timeout: 2000 });
  } catch {
    // If no success message, check if we're redirected to dashboard
    await expect(this.page).toHaveURL(/.*dashboard/, { timeout: 5000 });
  }
});

When('I enter the user data:', async function (dataTable: any) {
  const userData = dataTable.rowsHash();
  
  // Wait for form to be visible
  await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
  
  // Fill registration form
  if (userData.username) {
    await this.page.fill('input[name="username"]', userData.username);
  }
  if (userData.email) {
    const emailField = this.page.locator('input[name="email"]');
    if (await emailField.count() > 0) {
      await this.page.fill('input[name="email"]', userData.email);
    }
  }
  if (userData.password) {
    await this.page.fill('input[name="password"]', userData.password);
    
    // Also fill confirm password if it exists
    const confirmPasswordField = this.page.locator('input[name="confirmPassword"]');
    if (await confirmPasswordField.count() > 0) {
      await this.page.fill('input[name="confirmPassword"]', userData.password);
    }
  }
});

When('I try to access the dashboard directly', async function () {
  await this.page.goto(`${this.baseURL}/dashboard`);
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
});

// Error message verifications
Then('I should see an error message {string}', async function (expectedMessage: string) {
  // Use the English message directly since backend is now in English
  let actualMessage = expectedMessage;
  
  // Look for error in various possible locations
  const errorSelectors = [
    '.error',
    '.alert-error', 
    '.message.error',
    '[role="alert"]',
    '.notification.error'
  ];
  
  let errorFound = false;
  for (const selector of errorSelectors) {
    const errorElement = this.page.locator(selector);
    if (await errorElement.count() > 0 && await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      if (errorText && errorText.includes(actualMessage)) {
        errorFound = true;
        break;
      }
    }
  }
  
  if (!errorFound) {
    // If no specific error container, look for the text anywhere
    await expect(this.page.locator(`text=${actualMessage}`)).toBeVisible({ timeout: 5000 });
  }
});

Then('I should not have access to the dashboard', async function () {
  // Try to access dashboard
  await this.page.goto(`${this.baseURL}/dashboard`);
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
  
  // Should be redirected to auth page
  await expect(this.page).toHaveURL(/.*auth/, { timeout: 5000 });
});