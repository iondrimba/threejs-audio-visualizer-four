'use strict';
const Promise = require('es6-promise')
  .Promise;
const gulp = require('gulp');
const gulpsync = require('gulp-sync')(gulp);

//copies index.html file to public folder
gulp.task('copy', require('./tasks/copy.js'));

// using vinyl-source-stream:
gulp.task('browserify', require('./tasks/browserify.js'));

//eslint task
gulp.task('eslint', require('./tasks/eslint.js'));

//uglify task
gulp.task('uglify', require('./tasks/uglify.js'));

//sass - scss task
gulp.task('sass', require('./tasks/sass.js'));

//watch js/scss/teplate files
gulp.task('watch', require('./tasks/watch.js'));

//css min
gulp.task('minify-css', require('./tasks/minify-css.js'));

//html min
gulp.task('html-min', require('./tasks/html-min.js'));

//post css
gulp.task('post-css', require('./tasks/post-css.js'));

//local server
gulp.task('browser-sync', require('./tasks/browser-sync.js'));

// Default Task
gulp.task('default', gulpsync.sync(['copy', 'sass', 'eslint', 'browserify', 'browser-sync', 'watch']));

//publish Task
gulp.task('deploy', gulpsync.sync(['copy', 'sass', 'eslint', 'browserify']));

//optimization task isolated because of the asynchronous problems gulp has
gulp.task('optimize', gulpsync.sync(['uglify', 'minify-css', 'html-min']));
