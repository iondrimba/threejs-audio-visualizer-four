const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');

module.exports = function () {
  gulp.src('./src/scss/demo.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([require('autoprefixer')]))
    .pipe(gulp.dest('./public/css'));
};
