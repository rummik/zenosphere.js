module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
		        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
		        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
		        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
		        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

		watch: {
			packagejson: {
				files: '<%= jshint.packagejson %>',
				tasks: ['jshint:packagejson', 'pkgreload'],
			},

			gruntfile: {
				files: '<%= jshint.gruntfile %>',
				tasks: ['jshint:gruntfile'],
			},

			js: {
				files: '<%= jshint.dist %>',
				tasks: ['jshint:dist'],
			},
		},

		jshint: {
			packagejson: 'package.json',
			gruntfile: 'Gruntfile.js',
			dist: 'js/**/*.{js,json}',

			options: {
				jshintrc: '.jshintrc',
			},
		},

		uglify: {
			dist: {
				src: [
					'js/zenosphere.js',
					'js/stream.js',
					'js/source/*.js',
				],

				dest: 'dist/zenosphere.js',
			},

			options: {
				banner: '<%= banner %>',
			},
		},

		cssmin: {
			dist: {
				src: 'css/zenosphere.css',
				dest: 'dist/zenosphere.css',
			},

			options: {
				banner: '<%= banner %>',
			},
		},
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['test', 'minify']);
	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('minify', ['uglify', 'cssmin']);

	grunt.registerTask('pkgreload', 'Reload package.json', function() {
		grunt.log.writeln('Reloading package.json');
		grunt.config.data.pkg = grunt.file.readJSON('package.json');
	});
};
