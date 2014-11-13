'use strict';

var gulp = require('gulp');
var nconf = require('nconf');
var fs = require('fs');

nconf.argv().env().file('config/default.json');

gulp.plugin = require('gulp-load-plugins')();
gulp.config = nconf.get.bind(nconf);

fs.readdirSync('tasks').forEach(function(file) {
	if (file[0] === '_' || file.slice(-3) !== '.js') {
		return;
	}

	var name = file.slice(0, -3);
	var task = require(process.cwd() + '/tasks/' + file);

	gulp.task.apply(gulp, [name].concat(task));
});
