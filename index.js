'use strict';

var fs = require('fs'),
    jade = require('jade'),
    url = require('url'),
    pathUtil = require('path'),
    join = pathUtil.join,
    Compiler = require('./lib/compiler');

module.exports = function middleware(src, options) {

    if (!src && !options.src) {
        throw new Error('templates() requires "src" directory');
    }

    var dest,
        compilerFunction,
        format,
        namespace;

    // Set defaults
    options = options || {};
    src = src || options.src;
    format = options.format || 'underscore';
    namespace = options.namespace || 'jadeTemplates';
    dest = options.dest || src;
    compilerFunction = options.compile || jade.compile;

    // Middleware
    return function (req, res, next) {
        var path,
            paths,
            compiler;

        if ('GET' !== req.method && 'HEAD' !== req.method) {
            return next();
        }
        path = url.parse(req.url).pathname;

        if (/\.js$/.test(path) && path.indexOf('/templates/') !== -1) {
            path = path.replace('/templates', '');
            paths = {
                jsPath: join(dest, path),
                jadePath: join(src, path.replace('.js', '.jade'))
            };

            compiler = new Compiler({
                paths: paths,
                compile: compilerFunction,
                format: format,
                namespace: namespace,
                next: next
            });

            // Hang the request until the previous has been processed
            if (Compiler.queue[paths.jadePath]) {
                return Compiler.queue[paths.jadePath].on('end', next);
            }

            // Compile if there are differences between the source and the output
            fs.stat(paths.jadePath, function (err, jadeStats) {
                if (err) return this.error(err);
                fs.stat(paths.jsPath, function (err, jsStats) {
                    // JS has not been compiled, compile it!
                    if (err) {
                        if ('ENOENT' === err.code) {
                            compiler.compile();
                        } else {
                            next(err);
                        }
                    } else {
                        // Source has changed, compile it
                        if (jadeStats.mtime > jsStats.mtime) {
                            compiler.compile();
                        } else {
                            next();
                        }
                    }
                }.bind(this));
            }.bind(this));
        } else {
            next();
        }
    }.bind(this);
};
