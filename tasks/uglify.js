'use strict';

var gulp = require('gulp');

module.exports = function() {
	return gulp.src(gulp.config('source:js'))
		.pipe(gulp.plugin.cached('uglify'))
		.pipe(gulp.plugin.uglify())
		.pipe(gulp.plugin.remember('uglify'))
		.pipe(gulp.plugin.concat('zenosphere.js'))
		.pipe(gulp.dest('dist'));
};
