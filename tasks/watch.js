'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');

module.exports = [['jshint-internal', 'test', 'build'], function() {
	gulp.watch(gulp.config('source:internal'), ['jshint-internal']);

	gulp.watch(gulp.config('source:css'), ['stylus']);

	gulp.watch(gulp.config('source:js'), runSequence.bind({}, [
		'jshint',
		'uglify'
	]));
}];
