const gulp = require('gulp');
const browserSync = require('browser-sync')
  .create();

module.exports = function () {
  browserSync.init({
    server: './public'
  });
  gulp.watch('./../src/templates/index.html')
    .on('change', browserSync.reload);
  gulp.watch('./public/css/demo.css')
    .on('change', browserSync.reload);
  gulp.watch('./public/js/demo.js')
    .on('change', browserSync.reload);
};
