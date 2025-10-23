import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { setWorldConstructor, setDefaultTimeout, Before, After } from '@cucumber/cucumber';

setDefaultTimeout(60 * 1000); // 60 segundos

export class CustomWorld {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  public baseURL: string = 'http://localhost:3000';
  
  async init() {
    this.browser = await chromium.launch({ 
      headless: process.env.HEADLESS !== 'false',
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: process.env.VIDEO ? { dir: 'test-results/videos' } : undefined
    });
    this.page = await this.context.newPage();
  }

  async cleanup() {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  // Métodos helper para la aplicación
  async navigateToLogin() {
    await this.page.goto(`${this.baseURL}/auth/login`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToRegister() {
    await this.page.goto(`${this.baseURL}/auth/register`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToDashboard() {
    await this.page.goto(`${this.baseURL}/dashboard`);
    await this.page.waitForLoadState('networkidle');
  }

  async login(username: string, password: string) {
    await this.navigateToLogin();
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForLoadState('networkidle');
  }

  async logout() {
    await this.page.click('button.logout-btn');
    await this.page.waitForLoadState('networkidle');
  }

  async clearSessionData() {
    await this.context.clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  async addProduct(productData: {
    name: string;
    description: string;
    price: string;
    category: string;
    stock: string;
  }) {
    await this.page.fill('input[name="name"]', productData.name);
    await this.page.fill('textarea[name="description"]', productData.description);
    await this.page.fill('input[name="price"]', productData.price);
    await this.page.selectOption('select[name="category"]', productData.category);
    await this.page.fill('input[name="stock"]', productData.stock);
    await this.page.click('button[type="submit"]');
    await this.page.waitForLoadState('networkidle');
  }

  async deleteProduct(productName: string) {
    const productSelector = `text=${productName}`;
    const productElement = this.page.locator(productSelector).first();
    const deleteButton = productElement.locator('..').locator('button.btn-danger');
    await deleteButton.click();
  }

  async confirmDeleteDialog() {
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });
  }

  async cancelDeleteDialog() {
    this.page.on('dialog', async dialog => {
      await dialog.dismiss();
    });
  }
}

setWorldConstructor(CustomWorld);

Before(async function (this: CustomWorld) {
  await this.init();
});

After(async function (this: CustomWorld) {
  await this.cleanup();
});