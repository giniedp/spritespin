(function(){
  'use strict';

  var del = require('del');
  var gulp = require('gulp');
  var concat = require('gulp-concat');
  var uglify = require('gulp-uglify');
  var sass = require("gulp-sass");
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
    del([
      'page/docs',
      'page/*.*'
    ])
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
      .pipe(uglify({
        mangle: false,
        compress: true
      }))
      .pipe(gulp.dest('page'))
      .pipe(gulp.dest('release'));

    gulp.src('src/page/highlight.js')
      .pipe(uglify({

      }))
      .pipe(gulp.dest('page'));
  });

  gulp.task('page', function(){
    gulp.src('src/page/*.jade')
      .pipe(jade({ pretty: true }))
      .pipe(gulp.dest('page'));
  });

  gulp.task('style', function(){
    return gulp.src('src/page/style/style.scss')
      .pipe(sass({
        includePaths: ["bower_components/kube-scss/scss"]
      }).on("error", sass.logError))
      .pipe(gulp.dest('page'));
  });

  gulp.task('doc', function(){
    gulp.src(source)
      .pipe(docco({ layout: 'parallel' }))
      .pipe(gulp.dest('page/docs'))
  });

  gulp.task('build', ['style', 'page', 'concat', 'uglify', 'doc']);

  gulp.task('watch', ['build'], function(){
    gulp.watch("src/*.js", ['concat', 'uglify', 'doc']);
    gulp.watch("src/page/**/*.jade", ['page']);
    gulp.watch("src/page/**/*.scss", ['style']);
  });

  gulp.task('default', ['build']);

}());
