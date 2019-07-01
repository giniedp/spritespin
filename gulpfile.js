'use strict'

const del = require('del')
const gulp = require('gulp')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const path = require('path')
const shell = require('shelljs')
const rollup = require('rollup')

const dstDir = path.join(__dirname, 'release')
const srcDir = path.join(__dirname, 'src')
const docDir = path.join(dstDir, 'doc')

function exec(command, cb) {
  shell
    .exec(command, { async: true })
    .on('exit', (code) => cb(code === 0 ? null : code))
}

gulp.task('clean', () => del(dstDir))

gulp.task('build:tsc', ['clean'], (cb) => {
  exec('yarn run build', cb)
})

gulp.task('build:esm2015', ['clean'], (cb) => {
  exec('yarn run build:esm2015', cb)
})

gulp.task('build:rollup', ['build:tsc'], () => {
  const resolve = require('rollup-plugin-node-resolve')
  const sourcemaps = require('rollup-plugin-sourcemaps')
  const globals = {
    '$': 'jquery',
  }

  return rollup.rollup({
    amd: {id: `SpriteSpin`},
    input: path.join(dstDir, 'src', 'index.js'),
    onwarn: (warning, warn) => {
      if (warning.code === 'THIS_IS_UNDEFINED') {return}
      warn(warning);
    },
    plugins: [resolve(), sourcemaps()],
    external: Object.keys(globals),
  })
  .then((bundle) => {
    return bundle.write({
      format: 'umd',
      sourcemap: true,
      file: path.join(dstDir, 'spritespin.js'),
      name: 'SpriteSpin',
      globals: globals,
      exports: 'named',
    })
  })
})

gulp.task('build:uglify', ['build:rollup'], () => {
  return gulp
    .src(path.join(dstDir, 'spritespin.js'))
    .pipe(uglify())
    .pipe(concat('spritespin.min.js'))
    .pipe(gulp.dest(dstDir))
})

gulp.task('build', ['build:tsc', 'build:esm2015', 'build:rollup', 'build:uglify'])

gulp.task('watch', ['build', 'api:json'], () => {
  gulp.watch([ path.join('src', '**', '*.ts') ], ['build', 'api:json'])
})

gulp.task('publish', ['build'], (cb) => {
  exec('npm publish --access=public', cb)
})

gulp.task('api:json', ['build'], (cb) => {
  const ae = require('@microsoft/api-extractor')
  const config = ae.ExtractorConfig.prepare({
    configObject: {
      compiler: {
        tsconfigFilePath: path.join(__dirname, 'tsconfig.json'),
      },
      apiReport: {
        enabled: false,
        reportFileName: 'spritespin.api.md',
        reportFolder: path.join(__dirname, 'doc'),
        reportTempFolder: path.join(__dirname, 'tmp'),
      },
      docModel: {
        enabled: true,
        apiJsonFilePath: path.join(__dirname, 'doc', 'spritespin.api.json'),
      },
      dtsRollup: {
        enabled: false,
      },
      projectFolder: path.join(dstDir, 'src'),
      mainEntryPointFilePath: path.join(dstDir, 'src', 'index.d.ts'),
    }
  })
  config.packageFolder = process.cwd()
  config.packageJson = require('./package.json')

  const result = ae.Extractor.invoke(config, {
    // Equivalent to the "--local" command-line parameter
    localBuild: true,

    // Equivalent to the "--verbose" command-line parameter
    showVerboseMessages: true
  })
  if (result.succeeded) {
    exec('./node_modules/.bin/api-documenter markdown -i doc -o doc', cb)
  } else {
    cb(1)
  }
})
