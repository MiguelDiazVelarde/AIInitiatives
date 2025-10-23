const reporter = require('cucumber-html-reporter');

const options = {
  theme: 'bootstrap',
  jsonFile: 'reports/cucumber_report.json',
  output: 'reports/cucumber_report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: true,
  metadata: {
    "App Version": "1.0.0",
    "Test Environment": "Local",
    "Browser": "Chromium",
    "Platform": "Windows",
    "Parallel": "Scenarios",
    "Executed": "Local"
  }
};

reporter.generate(options);