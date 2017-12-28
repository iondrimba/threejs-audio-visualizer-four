const gulp = require('gulp');
const source = require('vinyl-source-stream');
const streamify = require('gulp-streamify');
const stringify = require('stringify');
const browserify = require('browserify');
const babelify = require('babelify');

module.exports = function () {
  stringify.registerWithRequire({
    extensions: ['.txt', '.html'],
    minify: true,
    minifier: {
      extensions: ['.html']
    }
  });

  const bundleStream = browserify('./src/scripts/demo.js')
    .transform(babelify, {
      'presets': ['es2015']
    })
    .transform(stringify(['.html']))
    .bundle();

  bundleStream
    .pipe(source('demo.js'))
    .pipe(gulp.dest('./public/js'))
};
