'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    clean: {
      files: [
        'dist/*.js',
        'dist/*.css',
        'dist/*.html'
      ]
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/scripts/spritespin.js', 'src/scripts/spritespin.api.js', 'src/scripts/spritespin.*-*.js'],
        dest: 'dist/spritespin.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/spritespin.min.js'
      }
    },
    docco: {
      dist: {
        options: {
          output: 'dist/docs/'
        },
        src: '<%= concat.dist.src %>'
      }
    },
    jade: {
      page:{
        options: {
          pretty: true,
          extension: '.html'
        },
        files: {
          'dest/': ['src/page/*.jade']
        }
      }
    },
    compass: {
      page: {
        options: {
          sassDir: 'src/style',
          cssDir: 'dist'
        }
      }
    },
    watch: {
      all: {
        options: {
          livereload: true
        },
        files: ['src/**/*'],
        tasks: ['clean', 'concat', 'uglify', 'slim', 'compass']
      }
    }
  });

  // These plugins provide necessary tasks.

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-jade');

  // Default task.
  grunt.registerTask('default', ['clean', 'concat', 'uglify', 'jade', 'compass']);
};
