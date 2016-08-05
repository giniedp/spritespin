'use strict';

var del = require('del');
var gulp = require('gulp');
var merge = require('merge');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require("gulp-sass");
var jade = require('gulp-jade');
var docco = require('gulp-docco');
var plumber = require('gulp-plumber');
var webserver = require('gulp-webserver');
var livereload = require('gulp-livereload');

var source = [
  'src/spritespin.js',
  'src/spritespin.api.js',
  'src/spritespin.api-*.js',
  'src/spritespin.beh-*.js',
  'src/spritespin.mod-*.js'
];

function src(){
  return gulp.src.apply(gulp, arguments)
  .pipe(plumber(function (err) {
    console.error(err.message || err);
  }))
}

gulp.task('clean', function(){
  del([
    'page/docs',
    'page/*.*'
  ])
});

//
// LIBRARY TASKS
//

gulp.task('spritespin', function(){
  return src(source)
    .pipe(concat("spritespin.js"))
    .pipe(gulp.dest('page'))
    .pipe(gulp.dest('release'))
    .pipe(livereload())
    .pipe(concat("spritespin.min.js"))
    .pipe(uglify({
      mangle: false,
      compress: true
    }))
    .pipe(gulp.dest('page'))
    .pipe(gulp.dest('release'));
});

//
// WEBSITE TASKS
//

gulp.task('page:scripts', function() {
  return gulp.src([
    'bower_components/jquery/dist/jquery.js',
    'bower_components/prism/prism.js',
    'bower_components/prism/components/prism-glsl.js',
    'bower_components/prism/components/prism-css.js',
    'bower_components/prism/components/prism-markup.js',
    'bower_components/prism/components/prism-javascript.js',
    'bower_components/prism/plugins/autolinker/prism-autolinker.js',
    'bower_components/prism/plugins/line-numbers/prism-line-numbers.js',
    'bower_components/prism/plugins/normalize-whitespace/prism-normalize-whitespace.js',
    'src/page/page.js',
  ])
  .pipe(concat('page.js'))
  .pipe(gulp.dest('page'))
  .pipe(livereload());
});

gulp.task('page:html', function() {
  return src('src/page/**/*.jade')
    .pipe(jade({ pretty: true }))
    .pipe(gulp.dest('page'))
    .pipe(concat('page.html'))
    .pipe(livereload());
});

gulp.task('page:style', function() {
  return src('src/page/style/style.scss')
    .pipe(sass({
      includePaths: ["bower_components/kube-scss/scss"]
    }).on("error", sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('page'))
    .pipe(livereload());
});

gulp.task('page:docs', function(){
  return gulp.src(source)
    .pipe(docco({ layout: 'parallel' }))
    .pipe(gulp.dest('page/docs'))
});

//
//
//

gulp.task('page', ['page:scripts', 'page:style', 'page:scripts', 'page:html', 'page:docs']);
gulp.task('build', ['spritespin', 'page']);
gulp.task('default', ['build']);

gulp.task('watch', ['build'], function(){
  gulp.watch("src/*.js", ['spritespin']);
  gulp.watch("src/page/**/*.js", ['page:scripts']);
  gulp.watch("src/page/**/*.jade", ['page:html']);
  gulp.watch("src/page/**/*.scss", ['page:style']);
});

gulp.task('serve', function() {
  gulp.src('page')
    .pipe(webserver({
      host: "0.0.0.0",
      port: 3000,
      livereload: true,
      directoryListing: false,
      open: false
    }));
});


