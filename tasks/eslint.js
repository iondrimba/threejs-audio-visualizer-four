const gulp = require('gulp');
const eslint = require('gulp-eslint');

module.exports = function () {
  return gulp.src(['./src/scripts/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
};
