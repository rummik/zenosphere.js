'use strict';

module.exports = function() {
	return this.src(this.config('source:js'))
		.pipe(this.plugin.cached('jshint'))
		.pipe(this.plugin.jshint('config/jshintrc.json'))
		.pipe(this.plugin.remember('jshint'))
		.pipe(this.plugin.jshint.reporter('jshint-stylish'));
};
