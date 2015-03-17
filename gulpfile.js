(function(){
  'use strict';

  var gulp = require('gulp');
  var concat = require('gulp-concat');
  var uglify = require('gulp-uglify');
  var clean = require('gulp-clean');
  var less = require("gulp-less");
  var shell = require('gulp-shell');
  var jade = require('gulp-jade');
  var docco = require('gulp-docco');

  var source = [
    'src/spritespin.js',
    'src/spritespin.api.js',
    'src/spritespin.api-*.js',
    'src/spritespin.beh-*.js',
    'src/spritespin.mod-*.js'
  ];

  gulp.task('clean', function(){
    gulp.src([
      'page/*.js',
      'page/*.css',
      'page/*.html'
    ]).pipe(clean())
  });

  gulp.task('concat', function(){
    gulp.src(source)
      .pipe(concat("spritespin.js"))
      .pipe(gulp.dest('page'))
      .pipe(gulp.dest('release'));
  });

  gulp.task('uglify', function(){
    gulp.src(source)
      .pipe(concat("spritespin.min.js"))
      .pipe(uglify("spritespin.min.js"))
      .pipe(gulp.dest('page'))
      .pipe(gulp.dest('release'));

    gulp.src('src/page/highlight.js')
      .pipe(uglify())
      .pipe(gulp.dest('page'));
  });

  gulp.task('page', function(){
    gulp.src('src/page/*.jade')
      .pipe(jade({ pretty: true }))
      .pipe(gulp.dest('page'));
  });

  gulp.task('style', function(){
    gulp.src('src/page/style/style.less')
      .pipe(less())
      .pipe(gulp.dest('page'));
  });

  gulp.task('doc', function(){
    gulp.src(source)
      .pipe(docco({ layout: 'parallel' }))
      .pipe(gulp.dest('page/docs'))
  });

  gulp.task('build', function(){
    gulp.run('style', 'page', 'concat', 'uglify', 'doc');
  });

  gulp.task('watch', function(){
    gulp.run('build');

    gulp.watch("src/*.js", function(){
      gulp.run('concat', 'uglify', 'doc');
    });

    gulp.watch("src/page/**/*.jade", function(){
      gulp.run('page');
    });

    gulp.watch("src/page/**/*.less", function(){
      gulp.run('style');
    });
  });

  gulp.task('default', function(){
    gulp.run('build');
  });

}());
