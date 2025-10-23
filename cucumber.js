module.exports = {
  default: {
    require: [
      'tests/support/hooks.js',
      'tests/step-definitions/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'json:reports/cucumber_report.json',
      'html:reports/cucumber_report.html'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    publishQuiet: true
  }
};