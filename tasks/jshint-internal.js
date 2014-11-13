'use strict';

module.exports = function() {
	var config = require('../config/jshintrc.json');
	var jshintrc = require('../config/jshintrc-internal.json');

	Object.keys(jshintrc).forEach(function(key) {
		config[key] = jshintrc[key];
	});

	return this.src(['gulpfile.js', '*.json', 'config/*.{js,json}', 'tasks/!(_*).js'])
		.pipe(this.plugin.cached('jshint-internal'))
		.pipe(this.plugin.jshint(config))
		.pipe(this.plugin.remember('jshint-internal'))
		.pipe(this.plugin.jshint.reporter('jshint-stylish'));
};
