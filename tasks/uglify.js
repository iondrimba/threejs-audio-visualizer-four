const gulp = require('gulp');
const uglify = require('gulp-uglify');

module.exports = function () {
  return gulp.src('./public/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'));
};
