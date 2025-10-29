import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { setWorldConstructor, setDefaultTimeout, Before, After } from '@cucumber/cucumber';

setDefaultTimeout(60 * 1000); // 60 seconds

export class CustomWorld {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  public baseURL: string = 'http://localhost:3000';
  
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