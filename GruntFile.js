module.exports = function(grunt) {
	var appJSFiles = {
		develop: [
			'src/js/app.js'
		],
		production: [
			'src/js/app.js'
		]
	};
	var vendorJSFiles = {
		develop: [
			'bower_components/jquery/dist/jquery.js',
			'bower_components/jquery-ui/jquery-ui.js',
			'bower_components/d3/d3.js',
			'bower_components/topojson/topojson.js',
			'bower_components/lodash/lodash.min.js',
			'bower_components/moment/moment.js',
			'src/vendor-js/webgl-heatmap.js',
			'node_modules/flickrapi/browser/flickrapi.dev.js',
			'src/vendor-js/county-topojson.js',
			'bower_components/jqrangeslider/jQRangeSliderMouseTouch.js',
			'bower_components/jqrangeslider/jQRangeSliderMouseTouch.js',
			'bower_components/jqrangeslider/jQRangeSliderDraggable.js',
			'bower_components/jqrangeslider/jQRangeSliderHandle.js',
			'bower_components/jqrangeslider/jQRangeSliderBar.js',
			'bower_components/jqrangeslider/jQRangeSliderLabel.js',
			'bower_components/jqrangeslider/jQRangeSlider.js',
			'bower_components/jqrangeslider/jQDateRangeSliderHandle.js',
			'bower_components/jqrangeslider/jQDateRangeSlider.js',
			'bower_components/jqrangeslider/jQEditRangeSliderLabel.js',
			'bower_components/jqrangeslider/jQEditRangeSlider.js'
		],
		production: [
		],
	};
	
	var uglifyOptions = {
		develop: {
			options: {
				mangle: false,
				compress: false,
				beautify: true
			},
			files: [{
				'webroot-dev/js/app.js': appJSFiles.develop
			}]
		},
		production: {
			options: {
				mangle: true,
				compress: {},	// note this appeases grunt or node or something
				beautify: false
			},
			files: [{
				'webroot-prod/js/app.js': appJSFiles.production
			}]
		}
	};

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			develop: {
				src: ['src/js/*.js']
			},
			production: {
				src: ['src/js/**.*.js']
			}
		},
		uglify: uglifyOptions,
		less: {
			develop: {
				options: {
					compress: false
				},
				src: 'src/less/toc.less',
				dest: 'webroot-dev/css/app.css'
			},
			production: {
				options: {
					compress: true
				},
				src: 'src/less/toc.less',
				dest: 'webroot-prod/css/app.css'
			}
		},
		concat: {
			develop: {
				files: [{
					'webroot-dev/js/vendor.js': vendorJSFiles.develop,
				}]
			},
			production: {
				files: [{
					'webroot-prod/js/vendor.js': vendorJSFiles.production
				}]
			}
		},
		copy: {
			develop: {
				files: [{
					'webroot-dev/index.php': 'src/index.php',
				}, {
					expand: true,
					cwd: 'src/img',
					src: '**/*',
					dest: 'webroot-dev/img/'
				}]
			},
			production: {
				files: [{
					'webroot-prod/index.php': 'src/index.php',
				}, {
					expand: true,
					cwd: 'src/img',
					src: '**/*',
					dest: 'webroot-prod/img/'
				}]
			}
		},
		
		watch: {
			files: [
				'src/js/**/*.js', 
				'src/index.php', 
				'src/less/**/*.less',
				'src/less/**/*.css',
				'src/img/**/*',
			],
			tasks: ['default']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).

	grunt.registerTask('default', [
		'uglify:develop', 
		'concat:develop', 
		'less:develop',
		'copy:develop'
	]);
	grunt.registerTask('develop', [
		'uglify:develop', 
		'concat:develop', 
		'less:develop',
		'copy:develop'
	]);
	grunt.registerTask('production', [
		'uglify:production', 
		'concat:production', 
		'less:production',
		'copy:production'
	]);
	
};