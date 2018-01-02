'use strict';

/**
 * @fileOverview Gulp#4 tasks
 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
 * @version 1.0.0
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const gulp = require('gulp');
const chalk = require('chalk');
const browserSync = require('browser-sync').create();
const ejs = require('gulp-ejs-monster');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass-monster');
const sourcemaps = require('gulp-sourcemaps');

const environment = require('./config/environment');
const config = require(`./config/config-${environment.type}`);
const notify = require('./config/notify');
const icons = require('./config/notify-icons');

// ----------------------------------------
// Private
// ----------------------------------------

console.log(chalk.yellow('Starting gulp...'));
console.log(chalk.yellow(`${environment.type} version`));

/**
 * Task sources
 * @const {Object}
 * @private
 * @sourceCode
 */
const sources = {
	sass: './page2page/page2page.scss',
	ejs: './examples/ejs/*.ejs'
};

/**
 * Errors flags
 * @const {Object}
 * @private
 * @sourceCode
 */
const wasErrors = {
	sass: false,
	ejs: false
};

/**
 * Save reference ejs config
 * @const {Object}
 * @see {@link https://github.com/dutchenkoOleg/gulp-ejs-monster#plugin-options}
 * @private
 * @sourceCode
 */
const ejsConfig = config.ejs;

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * SASS styles render
 * @sourceCode
 */
function sassRender () {
	let success = true;
	return gulp.src(sources.sass)
		.pipe(sourcemaps.init())
		.pipe(sass(config.sass, true).on('error', function (err) {
			success = false;
			wasErrors.sass = true;
			notify.onError('gulp-sass-monster', err.message, icons.sass);
			this.emit('end');
		}))
		.pipe(postcss(config.postcss).on('error', function (err) {
			success = false;
			wasErrors.sass = true;
			notify.onError('[gulp-postcss]', err.message, icons.postcss);
			this.emit('end');
		}))
		.pipe(sourcemaps.write(config.sourcemaps))
		.pipe(gulp.dest('./page2page/'))
		.on('end', () => {
			if (success) {
				if (wasErrors.sass) {
					wasErrors.sass = false;
					notify.onResolved('gulp-sass-monster');
				}
				if (environment.develop) {
					browserSync.stream();
				}
			}
		});
}

/**
 * ejs markup render
 * @sourceCode
 */
function ejsRender () {
	let success = true;
	return gulp.src(sources.ejs)
		.pipe(ejs(ejsConfig).on('error', function (err) {
			success = false;
			wasErrors.ejs = true;
			notify.onError('gulp-ejs-monster', err.message, icons.ejs);
			this.emit('end');
		}))
		.pipe(gulp.dest('./examples'))
		.on('end', () => {
			if (success) {
				if (wasErrors.ejs) {
					wasErrors.ejs = false;
					notify.onResolved('gulp-ejs-monster');
				}
				if (environment.develop) {
					browserSync.reload();
				}
			}
		});
}

/**
 * Watching task
 * @param done
 * @sourceCode
 */
function watch (done) {
	gulp.watch(sources.sass, sassRender);
	gulp.watch(sources.ejs, ejsRender);
	done();
}

/**
 * Browser-sync task
 * @param done
 * @sourceCode
 */
function bs (done) {
	let options = config.bs(browserSync);
	browserSync.init(options, done);
}

// ----------------------------------------
// Exports
// ----------------------------------------

gulp.task('sass', sassRender);
gulp.task('ejs', ejsRender);
gulp.task('watch', watch);
gulp.task('bs', bs);
gulp.task('default', gulp.series('sass', 'ejs', 'watch', 'bs'));
gulp.task('build', gulp.series('sass', 'ejs'));
