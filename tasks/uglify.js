'use strict';

module.exports = function() {
	return this.src(this.config('source:js'))
		.pipe(this.plugin.cached('uglify'))
		.pipe(this.plugin.uglify())
		.pipe(this.plugin.remember('uglify'))
		.pipe(this.plugin.concat('zenosphere.js'))
		.pipe(this.dest('dist'));
};
