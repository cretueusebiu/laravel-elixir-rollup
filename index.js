var gulp = require('gulp');
var rename = require('gulp-rename');
var buffer = require('vinyl-buffer');
var rollup = require('rollup-stream');
var Elixir = require('laravel-elixir');
var babel = require('rollup-plugin-babel');
var source = require('vinyl-source-stream');
var config = Elixir.config;
var plugins = Elixir.Plugins;

/**
 * Rollup Task.
 *
 * @param {String} src
 * @param {String} output
 * @param {Object} options
 */
Elixir.extend('rollup', function (src, output, options) {
    var paths = prepGulpPaths(src, output);
    var sourceMapFile = options ? options.sourceMapFile : false;
    var includeHelpers = options ? (options.hasOwnProperty('includeHelpers') ? options.includeHelpers : true) : true;

    if (options) {
        delete options.sourceMapFile;
        delete options.includeHelpers;
    }

    var babelOptions = {presets: ['es2015-rollup']};

    if (!includeHelpers) {
        babelOptions.externalHelpers = true;
        babelOptions.plugins = config.js.babel.options.plugins || [];
        babelOptions.plugins.push('external-helpers-2', 'transform-object-assign');
    }

    options = Object.assign({}, {
        entry: paths.src.path,
        sourceMap: config.sourcemaps,
        plugins: [babel(babelOptions)]
    }, options);

    new Elixir.Task('rollup', function () {
        this.log(paths.src, paths.output);

        return rollup(options)
            .on('error', function (e) {
                new Elixir.Notification().error(e, 'Rollup Failed!');
                this.emit('end');
            })
            .pipe(source(paths.src.name, paths.src.path))
            .pipe(buffer())
            .pipe(plugins.if(config.production, plugins.uglify()))
            .pipe(rename(paths.output.name))
            .pipe(plugins.if(sourceMapFile, plugins.sourcemaps.init({loadMaps: true})))
            .pipe(plugins.if(sourceMapFile, plugins.sourcemaps.write('.')))
            .pipe(gulp.dest(paths.output.baseDir))
            .pipe(new Elixir.Notification('Rollup Compiled!'));
    })
    .watch(paths.src.baseDir + '/**/*.js')
    .ignore(paths.output.path);
});

/**
 * Prep the Gulp src and output paths.
 *
 * @param  {String|Array} src
 * @param  {String|null}  output
 * @return {GulpPaths}
 */
var prepGulpPaths = function (src, output) {
    return new Elixir.GulpPaths()
        .src(src, config.get('assets.js.folder'))
        .output(output || config.get('public.js.outputFolder'), 'bundle.js');
};
