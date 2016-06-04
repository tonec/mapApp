var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var jshint = require('gulp-jshint');
var browserify = require('browserify');
var vinylSource = require('vinyl-source-stream');
var plumber = require('gulp-plumber');
var karma = require('gulp-karma');
var ngAnnotate = require('gulp-ng-annotate');

var paths = {
	sass: ['./scss/**/*.scss'],
	js: ['./www/app/**/*.js', './www/common/**/*.js']
};

var onError = function (err) {
	gutil.beep();
	console.log(err);
};

gulp.task('sass', function(done) {
	gulp.src('./scss/ionic.app.scss')
		.pipe(sass())
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(gulp.dest('./www/css/'))
		.pipe(minifyCss({
			keepSpecialComments: 0
		}))
		.pipe(rename({ extname: '.min.css' }))
		.pipe(gulp.dest('./www/css/'))
		.on('end', done);
});

gulp.task('install', function() {
	return bower.commands.install()
		.on('log', function(data) {
			gutil.log('bower', gutil.colors.cyan(data.id), data.message);
		});
});

gulp.task('lint', function() {
	return gulp.src(paths.js)
		.pipe(jshint())
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('browserify', function() {
	return browserify('./www/app/app.js', {debug: true})
		.bundle()
		.pipe(vinylSource('bundle.js'))
		.pipe(ngAnnotate())
		.pipe(gulp.dest('./www/dist'));
});

gulp.task('test', function() {
	return gulp.src('./dummy.js')
		.pipe(karma({
			configFile: 'karma.conf.js',
			action: 'run'
		}))
		.on('error', function(err) {
			console.log(err);
			this.emit('end');
		})
});

gulp.task('watch', function() {
	gulp.watch(paths.sass, ['sass']);
	gulp.watch(paths.js, ['lint', 'browserify', 'test']);
});

gulp.task('default', ['sass', 'lint', 'browserify', 'test', 'watch']);
