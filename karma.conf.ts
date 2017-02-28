'use strict'

let tsconfig = require('./tsconfig.json'); // tslint:disable-line

module.exports = (config) => {
  config.set({
    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-typescript-preprocessor',
      'karma-coverage'
    ],
    frameworks: [
      'jasmine'
    ],
    browsers: [
      'PhantomJS'
    ],
    files: [
      'node_modules/jquery/dist/jquery.js',
      ...(tsconfig.files),
      'src/**/*.test.ts'
    ],

    preprocessors: {
      '**/*test.ts': ['typescript'],
      '**/!(*test).ts': ['typescript', 'coverage']
    },
    reporters: [
      'dots', 'coverage'
    ],

    typescriptPreprocessor: {
      tsconfigPath: './tsconfig.json',
      transformPath: (path) => {
        return path.replace(/\.ts$/, '.js')
      }
    },

    coverageReporter: {
      dir: 'coverage',
      reporters: [{
        type : 'html',
        subdir: 'report-html'
      }]
    }
  })
}
