import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

When('I navigate to the main page', async function (this: CustomWorld) {
  await this.page.goto(this.baseURL);
  await this.page.waitForLoadState('networkidle');
});

Then('I should be redirected to the login page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/.*login/);
});