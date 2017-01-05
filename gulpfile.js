'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

gulp.task('lint', () => {
    return gulp.src(['./*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', ['lint'], () => {
    return gulp.src(['./test.js'])
        .pipe(mocha());
});

gulp.task('default', ['test']);
