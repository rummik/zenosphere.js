'use strict';

var gulp = require('gulp');
var nconf = require('nconf');
var fs = require('fs');

nconf.argv().env().file('config/default.json');

gulp.plugin = require('gulp-load-plugins')();
gulp.config = nconf.get.bind(nconf);

require('gulp-load-tasks')('tasks');
