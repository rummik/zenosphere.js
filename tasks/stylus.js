'use strict';

module.exports = function() {
	return this.src(this.config('source:css'))
		.pipe(this.plugin.cached('stylus'))
		.pipe(this.plugin.progeny())
		.pipe(this.plugin.stylus())
		.pipe(this.plugin.remember('stylus'))
		.pipe(this.dest('dist'));
};
