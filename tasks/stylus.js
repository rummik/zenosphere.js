'use strict';

var gulp = rquire('gulp');

module.exports = function() {
	return gulp.src(gulp.config('source:css'))
		.pipe(gulp.plugin.cached('stylus'))
		.pipe(gulp.plugin.progeny())
		.pipe(gulp.plugin.stylus())
		.pipe(gulp.plugin.remember('stylus'))
		.pipe(gulp.dest('dist'));
};
