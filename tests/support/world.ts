import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { setWorldConstructor, setDefaultTimeout, Before, After } from '@cucumber/cucumber';

setDefaultTimeout(60 * 1000); // 60 seconds

export class CustomWorld {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  public baseURL: string = process.env.TEST_BASE_URL || 'http://localhost:3000';
  
  // Properties for test data
  public invalidRegistrationData: any;
  public lastResponse: any;
  public maliciousInput: string = '';
  public testPassword: string = '';
  public testUser: any;
  public registrationComplete: boolean = false;
  public newProduct: any;
  public errorScenario: string = '';
  public caughtError: any;
  public concurrentUsers: boolean = false;
  public multiStepOperation: boolean = false;
  public operationFailed: boolean = false;
  
  // Backend testing properties
  public serverResponse: any;
  public apiEndpoints: any;
  public backendAvailable: boolean = false;
  public codeExamination: any;
  public endpoints: string[] = [];
  public requestResponses: any = {};
  public protectedEndpoints: string[] = [];
  public unauthenticatedResponse: any;
  public validationResponses: any = {};
  public authSystem: boolean = false;
  public authEndpoints: any = {};
  public productSystem: boolean = false;
  public productEndpoints: any = {};
  // Frontend testing properties
  public reactElements: number = 0;
  public frontendAvailable: boolean = false;
  public clientSideErrors: number = 0;
  public globalStateRequired: boolean = false;
  public stateManagementTested: boolean = false;
  public multipleViews: string[] = [];
  public navigationTested: boolean = false;
  public navigationTime: number = 0;
  public appStructure: boolean = false;
  public componentCount: number = 0;
  public apiIntegration: boolean = false;
  public apiCallsMade: boolean = false;
  public responsiveTested: boolean = false;
  
  async init() {
    this.browser = await chromium.launch({ 
      headless: process.env.HEADLESS !== 'false',
      slowMo: process.env.SLOW_MO ? Number.parseInt(process.env.SLOW_MO, 10) : 0
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

  /**
   * Safely wait for page to load with timeout and fallback strategies.
   * Uses 'domcontentloaded' instead of 'networkidle' to avoid timeout issues in CI/CD.
   */
  async safeWaitForLoad(options?: { timeout?: number }) {
    const timeout = options?.timeout || 10000;
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout });
    } catch (error) {
      // Log the timeout but continue - page might still be functional
      console.log('⚠️ Page load wait timeout, continuing anyway...', 
        error instanceof Error ? error.message : String(error));
    }
    // Small delay to let React hydrate
    await this.page.waitForTimeout(500);
  }

  // Métodos helper para la aplicación
  private async navigateToAuthPage() {
    await this.page.goto(`${this.baseURL}/auth`, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
  }

  async navigateToLogin() {
    await this.navigateToAuthPage();
  }

  async navigateToRegister() {
    await this.navigateToAuthPage();
    // Note: Login and Register share the same /auth page with toggle functionality
  }

  async navigateToDashboard() {
    await this.page.goto(`${this.baseURL}/dashboard`, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    // Wait for dashboard to load
    await this.page.waitForSelector('h1:has-text("Dashboard"), .dashboard-header', { 
      timeout: 10000 
    }).catch(() => {
      console.log('⚠️ Dashboard selector not found, but navigation completed');
    });
  }

  async login(username: string, password: string) {
    // Try to register user first (will fail silently if already exists)
    try {
      await this.page.request.post(`${this.baseURL}/api/auth/register`, {
        data: {
          username: username,
          email: `${username}@example.com`,
          password: password
        }
      });
    } catch (error) {
      // User might already exist, that's ok
      console.log(`ℹ️ User ${username} registration skipped (may already exist)`);
    }
    
    await this.navigateToLogin();
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    // Wait for navigation after login (should go to dashboard)
    await this.page.waitForURL(/.*\//, { timeout: 15000 });
    await this.page.waitForTimeout(1000);
  }

  async loginAsTestUser() {
    // Create or use existing test user
    const testUser = {
      username: 'testuser123',
      email: 'testuser123@example.com',
      password: 'password123'
    };
    
    // Try to register (will fail if already exists, that's ok)
    await this.page.request.post('/api/auth/register', {
      data: testUser
    });
    
    // Login with test user
    await this.login(testUser.username, testUser.password);
  }

  async logout() {
    await this.page.click('button.logout-btn');
    // Wait for navigation after logout (should go to auth)
    await this.page.waitForURL(/.*auth/, { timeout: 15000 });
    await this.page.waitForTimeout(500);
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
    await this.page.fill('input[name="category"]', productData.category); // Category is a text input, not select
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