'use strict'

const remap = false
const coveralls = false
const tsconfig = require('./tsconfig.json') // tslint:disable-line
tsconfig.compilerOptions.inlineSourceMap = false

module.exports = (config) => {
  config.set({
    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-typescript-preprocessor',
      'karma-sourcemap-loader',
      'karma-mocha-reporter',

      'karma-coveralls',
      'karma-coverage',
      'karma-remap-coverage'
    ],
    logLevel: 'info',

    frameworks: [
      'jasmine'
    ],
    browsers: [
      'PhantomJS'
      // 'Chrome',
      // 'Firefox',
      // 'Safari'
    ],
    files: [
      'node_modules/jquery/dist/jquery.js',
      ...tsconfig.files,
      'tools/**/*.ts',
      'src/**/*.test.ts'
    ],

    preprocessors: {
      '**/*.test.ts': ['typescript'],
      '**/!(*test).ts': [
        'typescript',
        remap ? 'sourcemap' : null,
        'coverage'
      ].filter((it) => !!it)
    },
    reporters: [
      'mocha',
      'coverage',
      coveralls ? 'coveralls' : null,
      remap ? 'remap-coverage' : null
    ].filter((it) => !!it),

    typescriptPreprocessor: {
      options: tsconfig.compilerOptions,
      typescript: require('typescript') // tslint:disable-line
    },

    coverageReporter: {
      dir : 'coverage/',
      reporters: [
        remap ? { type: 'in-memory' } : { type: 'html', subdir: 'report-html' },
        { type: 'lcov' }
      ]
    },

    remapCoverageReporter: {
      'text-summary': null, // to show summary in console
      html: './coverage/report-html'
    }
  })
}
