'use strict';

var gulp = require('gulp');

module.exports = function() {
	var config = require('../config/jshintrc.json');
	var jshintrc = require('../config/jshintrc-internal.json');

	Object.keys(jshintrc).forEach(function(key) {
		config[key] = jshintrc[key];
	});

	return gulp.src(['gulpfile.js', '*.json', 'config/*.{js,json}', 'tasks/!(_*).js'])
		.pipe(gulp.plugin.cached('jshint-internal'))
		.pipe(gulp.plugin.jshint(config))
		.pipe(gulp.plugin.remember('jshint-internal'))
		.pipe(gulp.plugin.jshint.reporter('jshint-stylish'));
};
