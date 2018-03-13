'use strict'

const del = require('del')
const gulp = require('gulp')
const path = require('path')
const shell = require('shelljs')
const rollup = require('rollup')

const dstDir = path.join(__dirname, 'release')

gulp.task('clean', () => del(dstDir))

gulp.task('build:esm5', ['clean'], (cb) => {
  shell
    .exec('yarn run build:esm5', { async: true })
    .on('exit', (code) => cb(code === 0 ? null : code))
})

gulp.task('build:esm2015', ['clean'], (cb) => {
  shell
    .exec('yarn run build:esm2015', { async: true })
    .on('exit', (code) => cb(code === 0 ? null : code))
})

gulp.task('build:rollup', ['build:esm5'], () => {
  const resolve = require('rollup-plugin-node-resolve')
  const sourcemaps = require('rollup-plugin-sourcemaps')
  const globals = {
    '$': 'jquery',
  }

  return rollup.rollup({
    amd: {id: `SpriteSpin`},
    input: path.join(dstDir, 'esm5', 'index.js'),
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

gulp.task('build:typings', ['build:esm5', 'build:esm2015'], () => {
  return gulp
    .src([ path.join(dstDir, 'esm2015', '**', '*.d.ts') ])
    .pipe(gulp.dest(path.join(dstDir, 'typings')))
    .on('end', () => {
      del([
        path.join(dstDir, 'esm2015', '**', '*.d.ts'),
        path.join(dstDir, 'esm5', '**', '*.d.ts')
      ])
    })
})

gulp.task('build', ['build:esm5', 'build:esm2015', 'build:rollup', 'build:typings'], () => {
  //
})

