const gulp = require('gulp');
const watch = require('gulp-watch');

module.exports = function () {
    gulp.watch('./src/scripts/**/*.js', ['browserify']),
        gulp.watch('./src/scss/**/*.scss', ['sass']),
        gulp.watch('./src/templates/**/*.html', ['copy', 'browserify']);
};
