'use strict';

var gulp = rquire('gulp');

module.exports = function() {
	return gulp.src(gulp.config('source:js'))
		.pipe(gulp.plugin.cached('jshint'))
		.pipe(gulp.plugin.jshint('config/jshintrc.json'))
		.pipe(gulp.plugin.remember('jshint'))
		.pipe(gulp.plugin.jshint.reporter('jshint-stylish'));
};
