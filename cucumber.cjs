/* eslint-disable */
module.exports = {
  default: {
    requireModule: ['tsx/cjs'],
    require: ['features/support/**/*.ts', 'features/step_definitions/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: [
      'progress-bar',
      'summary',
      'html:reports/cucumber.html',
      'json:reports/cucumber.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
    tags: '(@smoke or @unit) and not @pending and not @manual',
  },
};
