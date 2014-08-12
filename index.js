'use strict';

var fs = require('fs'),
    jade = require('jade'),
    url = require('url'),
    pathUtil = require('path'),
    join = pathUtil.join,
    JadeCompiler = require('./lib/compiler');

module.exports = function middleware(options) {

    var src,
        dest,
        compilerFunction,
        namespace;

    options = options || {};
    namespace = options.namespace || 'jadeTemplates';

    // Source dir required
    src = options.src;
    dest = options.dest || src;

    if (!src) {
        throw new Error('templates() requires "src" directory');
    }

    // Default compile callback
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
            compiler = new JadeCompiler({
                paths: paths,
                compile: compilerFunction,
                namespace: namespace,
                next: next
            });
            // console.log('PATH >>>', compiler);

            // Hang the request until the previous has been processed
            if (JadeCompiler.queue[paths.jadePath]) {
                return JadeCompiler.queue[paths.jadePath].on('end', next);
            }

            // Re-compile on server restart, disregarding
            // mtimes since we need to map templateCompiled
            if (!JadeCompiler.templateCompiled[paths.jsPath]) {
                return compiler.compile();
            }

            // Compare mtimes
            fs.stat(paths.jadePath, function (err, jadeStats) {
                if (err) {
                    return this.error(err);
                }
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
