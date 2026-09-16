import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

function courseCard(world: CustomWorld, courseName: string) {
  return world.page.locator('.course-card', { has: world.page.locator(`h3:has-text("${courseName}")`) });
}

Then('I should see the course {string}', async function (this: CustomWorld, courseName: string) {
  await expect(courseCard(this, courseName)).toBeVisible({ timeout: 10000 });
});

When('I open the syllabus for the course {string}', async function (this: CustomWorld, courseName: string) {
  await courseCard(this, courseName).locator('.toggle-syllabus-btn').click();
});

Then('I should see its modules with objectives and content', async function (this: CustomWorld) {
  const modules = this.page.locator('.course-module-item');
  await expect(modules.first()).toBeVisible({ timeout: 5000 });
  expect(await modules.count()).toBeGreaterThan(0);
  await expect(modules.first().locator('text=Objectives')).toBeVisible();
  await expect(modules.first().locator('text=Content')).toBeVisible();
});

When('I register progress for the course {string} with:', async function (this: CustomWorld, courseName: string, dataTable: any) {
  const data = dataTable.rowsHash();
  await courseCard(this, courseName).locator('.register-progress-btn').click();
  await this.page.waitForSelector('input[name="minutesStudied"]', { timeout: 10000 });
  await this.page.fill('input[name="minutesStudied"]', data.minutesStudied);
  if (data.status) {
    await this.page.selectOption('select[name="status"]', data.status);
  }
  if (data.notes) {
    await this.page.fill('textarea[name="notes"]', data.notes);
  }
  await this.page.click('button.submit-btn');
  await this.page.waitForTimeout(1000);
});

Then('the progress entry should be saved successfully', async function (this: CustomWorld) {
  await expect(this.page.locator('.progress-form-container')).not.toBeVisible({ timeout: 5000 });
});

Then('I should be taken to the statistics view', async function (this: CustomWorld) {
  await expect(this.page.locator('.progress-stats, .no-stats').first()).toBeVisible({ timeout: 5000 });
});

Given('I have registered at least one study session', async function (this: CustomWorld) {
  await this.registerCourseProgress('AI Engineering', {
    minutesStudied: '30',
    status: 'in-progress',
    notes: 'Session registered by the automated test',
  });
});

When('I view my statistics', async function (this: CustomWorld) {
  await this.page.goto(`${this.baseURL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await this.page.click('.toggle-btn:has-text("Statistics")');
});

Then('I should see the total number of sessions', async function (this: CustomWorld) {
  await expect(this.page.locator('.stat-label:has-text("Sessions")')).toBeVisible({ timeout: 5000 });
});

Then('I should see the total minutes studied', async function (this: CustomWorld) {
  await expect(this.page.locator('.stat-label:has-text("Minutes studied")')).toBeVisible({ timeout: 5000 });
});

Then('I should see my study streak', async function (this: CustomWorld) {
  await expect(this.page.locator('.stat-label:has-text("Day streak")')).toBeVisible({ timeout: 5000 });
});

When('I switch to the statistics view', async function (this: CustomWorld) {
  await this.page.click('.toggle-btn:has-text("Statistics")');
});

Then('I should see the statistics panel', async function (this: CustomWorld) {
  await expect(this.page.locator('.progress-stats, .no-stats').first()).toBeVisible({ timeout: 5000 });
});

When('I switch to the courses view', async function (this: CustomWorld) {
  await this.page.click('.toggle-btn:has-text("Courses")');
});

Then('I should see the course catalog', async function (this: CustomWorld) {
  await expect(this.page.locator('.courses-grid, .course-list, .no-courses').first()).toBeVisible({ timeout: 5000 });
});

When('I open the progress form for the course {string}', async function (this: CustomWorld, courseName: string) {
  await courseCard(this, courseName).locator('.register-progress-btn').click();
  await this.page.waitForSelector('.progress-form-container', { timeout: 10000 });
});

When('I try to submit the progress form without entering minutes studied', async function (this: CustomWorld) {
  await this.page.fill('input[name="minutesStudied"]', '');
  await this.page.click('button.submit-btn');
  await this.page.waitForTimeout(500);
});

Then('the progress form should still be visible', async function (this: CustomWorld) {
  await expect(this.page.locator('.progress-form-container')).toBeVisible({ timeout: 5000 });
});
