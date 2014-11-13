'use strict';

var runSequence = require('run-sequence');

module.exports = [['jshint-internal', 'test', 'build'], function() {
	this.watch(this.config('source:internal'), ['jshint-internal']);

	this.watch(this.config('source:css'), ['stylus']);

	this.watch(this.config('source:js'), runSequence.bind({}, [
		'jshint',
		'uglify'
	]));
}];
