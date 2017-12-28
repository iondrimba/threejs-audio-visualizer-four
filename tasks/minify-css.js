const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');

module.exports = function () {
  return gulp.src('./public/css/*.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('./public/css'));
};
