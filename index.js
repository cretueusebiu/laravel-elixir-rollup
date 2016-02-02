var gulp = require('gulp');
var _ = require('underscore');
var rename = require('gulp-rename');
var buffer = require('vinyl-buffer');
var rollup = require('rollup-stream');
var Elixir = require('laravel-elixir');
var babel = require('rollup-plugin-babel');
var source = require('vinyl-source-stream');

/**
 * Rollup Task.
 *
 * @param  {String} src
 * @param  {String} output
 * @param  {Object} options
 */
Elixir.extend('rollup', function (src, output, options) {
    var paths = prepGulpPaths(src, output);

    options = _.extend({
        entry: paths.src.path,
        sourceMap: config.sourcemaps,
        plugins: [
            babel({
                presets:  ['es2015-rollup']
            })
        ],
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
            .pipe(Elixir.Plugins.if(config.production, Elixir.Plugins.uglify()))
            .pipe(rename(paths.output.name))
            .pipe(gulp.dest(paths.output.baseDir))
            .pipe(new Elixir.Notification('Rollup Compiled!'));
    })
    .watch(paths.src.path)
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
