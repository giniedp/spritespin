'use strict'

let tsconfig = require('./tsconfig.json'); // tslint:disable-line
let co = tsconfig.compilerOptions
delete co.outFile
delete co.outDir
co.sourceMap = true

// co.sourceRoot = './src'
// co.inlineSourceMap = true
// co.inlineSources = true

module.exports = (config) => {
  config.set({
    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-typescript-preprocessor2',

      'karma-sourcemap-loader',
      'karma-sourcemap-writer',
      'karma-coverage',
      'karma-remap-istanbul'
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
      '**/*.test.ts': ['typescript'],
      '**/!(*test).ts': ['typescript', 'sourcemap', 'sourcemap-writer', 'coverage']
    },
    reporters: [
      'dots', 'coverage'
    ],

    typescriptPreprocessor: {
      tsconfigPath: './tsconfig.json',
      compilerOptions: co,
      sourcemapOptions: {
        includeContent: true,
        sourceRoot: './src'
      },
      transformPath: (path) => {
        return path.replace(/\.ts$/, '.js')
      }
    },

    coverageReporter: {
      type: 'json',
      subdir: '.',
      file: 'coverage-final.json'
    },

    //coverageReporter: {
    //  type: 'in-memory',
    //  instrumenterOptions: {
    //    istanbul: { noCompact: true }
    //  }
    //},

    remapCoverageReporter: {
      'text-summary': null,
      html: './coverage/html'
    },
    remapIstanbulReporter: {
      reports: {
        html: 'coverage'
      }
    },

    autoWatch: true,
    singleRun: true
  })
}
