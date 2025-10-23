# 🧪 Functional Testing with Gherkin and Playwright

This project includes a complete set of automated functional tests using **Cucumber (Gherkin)** and **Playwright**.

## 🎯 Test Coverage

### 1. **Authentication** (`authentication.feature`)

- ✅ Login with valid credentials
- ✅ Login with invalid credentials  
- ✅ New user registration
- ✅ Registration with existing user
- ✅ Logout
- ✅ Unauthorized access to dashboard

### 2. **Product Management** (`products.feature`)

- ✅ Add new products
- ✅ View product list (empty and with elements)
- ✅ Delete products (confirm and cancel)
- ✅ Required fields validation
- ✅ Products by categories (Scenario Outline)

### 3. **Navigation and UI** (`navigation.feature`)

- ✅ Navigation between pages
- ✅ Interface responsiveness
- ✅ UI elements validation
- ✅ Session persistence
- ✅ Session timeout

## 🛠️ Technologies Used

- **Cucumber.js** - BDD framework for Gherkin
- **Playwright** - Browser automation
- **TypeScript** - Static typing for step definitions
- **HTML Reporter** - Visual result reports

## 📁 Test Structure

```
tests/
├── features/                 # .feature files in Gherkin
│   ├── authentication.feature
│   ├── products.feature
│   ├── navigation.feature
│   └── smoke.feature
├── step-definitions/         # Step implementations
│   ├── authentication.steps.ts
│   ├── products.steps.ts
│   ├── navigation.steps.ts
│   └── smoke.steps.ts
└── support/                  # Configuration and helpers
    └── world.ts             # Cucumber World with Playwright
```

## 🚀 Running Tests

### Main Commands

```bash
# Run all tests
npm run test

# Run with HTML report
npm run test:full

# Run in visible mode (not headless)
npm run test:headed

# Run specific tests
npm run test:auth          # Authentication only
npm run test:products      # Products only  
npm run test:navigation    # Navigation only
```

### Automated Scripts

```bash
# Windows
run-tests.bat

# Linux/Mac
chmod +x run-tests.sh
./run-tests.sh
```

## 📊 Reports

Reports are automatically generated in:

- **JSON**: `reports/cucumber_report.json`
- **HTML**: `reports/cucumber_report.html`

The HTML report includes:

- ✅ Status of each scenario (✅ Passed, ❌ Failed)
- ⏱️ Execution times
- 📊 General statistics
- 🔍 Failure details with stack traces

## 🎭 Browser Configuration

Tests are configured to run on:

- **Chromium** (default)
- **Firefox** 
- **Safari/WebKit**

### Environment Variables

```bash
# Run in visible mode
HEADLESS=false npm run test:cucumber

# Change execution speed
SLOW_MO=1000 npm run test:cucumber

# Record videos
VIDEO=true npm run test:cucumber
```

## 🔧 Custom Configuration

### Cucumber.js (`cucumber.js`)

```javascript
module.exports = {
  default: {
    require: ['tests/step-definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'json:reports/cucumber_report.json']
  }
};
```

### Playwright (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  }
});
```

## 📝 Writing New Tests

### 1. Create Feature in Gherkin

```gherkin
# language: en
Feature: New functionality
  As a user
  I want to do something
  So that I get a benefit

  Scenario: Test case
    Given I have an initial condition
    When I execute an action
    Then I should see a result
```

### 2. Implement Step Definitions

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('I have an initial condition', async function (this: CustomWorld) {
  // Implementation
});

When('I execute an action', async function (this: CustomWorld) {
  // Implementation
});

Then('I should see a result', async function (this: CustomWorld) {
  // Implementation with expect()
});
```

## 🐛 Debug and Troubleshooting

### Run in Debug Mode

```bash
npm run test:debug
```

### Common Issues

1. **Application won't start**: Check that port 3000 is free
2. **Timeouts**: Increase timeout in `world.ts`
3. **Elements not found**: Check CSS selectors
4. **Sessions**: Clear cookies between tests

### Detailed Logs

```bash
# Enable Playwright logs
DEBUG=pw:api npm run test:cucumber
```

## 🎯 Best Practices

### Scenario Structure

- ✅ **Descriptive**: Clear and specific names
- ✅ **Independent**: Each scenario is autonomous
- ✅ **Reusable**: Common steps between features
- ✅ **Test data**: Use tables for multiple data

### Step Definitions

- ✅ **Atomic**: One step = one action/verification
- ✅ **Reusable**: Same steps in different features
- ✅ **Explicit waits**: `waitForLoadState`, `waitForSelector`
- ✅ **Clear assertions**: Descriptive error messages

### Maintenance

- 🔄 **Regular refactoring** of duplicate steps
- 📊 **Execution time monitoring**
- 🧹 **Data cleanup** between tests
- 📝 **Updated documentation**

## 📈 Metrics and KPIs

The framework automatically tracks:

- ⏱️ **Execution time** per scenario
- 📊 **Success/failure rate** per feature
- 🎯 **Functional coverage** of the application
- 🚀 **UI performance**

---

For more information, check the documentation for [Cucumber.js](https://cucumber.io/docs/cucumber/) and [Playwright](https://playwright.dev/).