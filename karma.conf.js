'use strict'

const IS_COVERALLS = !!process.env.IS_COVERALLS
const IS_COVERAGE = IS_COVERALLS || !!process.env.IS_COVERAGE
const IS_TRAVIS = !!process.env.TRAVIS

module.exports = (config) => {
  config.set({
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-typescript',
      'karma-mocha-reporter',
    ],
    logLevel: 'info',
    basePath: __dirname,

    frameworks: [
      'jasmine',
      'karma-typescript',
    ],
    browsers: [
      IS_TRAVIS ? 'Firefox' : 'ChromeHeadless'
    ],
    files: [
      'lib/**/*.ts',
    ],
    preprocessors: {
      '**/*.ts': ['karma-typescript'],
    },
    reporters: [
      'mocha',
      'karma-typescript',
    ],

    karmaTypescriptConfig: {
      tsconfig: 'lib/tsconfig.test.json',
      converageOptions: {
        instrumentation: IS_COVERAGE,
        exclude: /\.(d|spec|test)\.ts/i,
      },
      reports: {
        'text-summary': '',
        html: {
          directory: 'dist/coverage',
          subdirectory: 'html',
        },
        lcovonly: {
          directory: 'dist/coverage',
          subdirectory: 'lcov',
        },
      },
    },

  })
}
