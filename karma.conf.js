'use strict'

const IS_COVERALLS = !!process.env.IS_COVERALLS
const IS_COVERAGE = IS_COVERALLS || !!process.env.IS_COVERAGE
const IS_TRAVIS = !!process.env.TRAVIS

module.exports = (config) => {
  config.set({
    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
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
      // 'node_modules/jquery/dist/jquery.js',
      'src/**/*.ts',
    ],
    preprocessors: {
      '**/*.ts': ['karma-typescript'],
    },
    reporters: [
      'mocha',
      'karma-typescript',
    ],

    karmaTypescriptConfig: {
      bundlerOptions: {
        entrypoints: /\.test\.ts$/,
        sourceMap: true,
        validateSyntax: false,
      },
      exclude: ['node_modules', 'release'],
      // compilerOptions: tsconfig.compilerOptions,
      tsconfig: 'tsconfig.test.json',
      // Pass options to remap-istanbul.
      // remapOptions: {
      //   // a regex for excluding files from remapping
      //   // exclude: '',
      //   // a function for handling error messages
      //   warn: (msg) => console.log(msg)
      // },
      converageOptions: {
        instrumentation: IS_COVERAGE,
        exclude: /\.(d|spec|test)\.ts/i,
      },
      reports: {
        'text-summary': '',
        html: {
          directory: 'coverage',
          subdirectory: 'html',
        },
        lcovonly: {
          directory: 'coverage',
          subdirectory: 'lcov',
        },
      },
    },

  })
}
