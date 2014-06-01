'use strict';

var fs = require('fs'),
    jade = require('jade'),
    url = require('url'),
    pathUtil = require('path'),
    join = pathUtil.join,
    EventEmitter = require('events').EventEmitter;

var templateCompiled = {};
var JadeCompiler;


module.exports.JadeCompiler = JadeCompiler = function (options) {
    this.startString = '(function () { \n' + options.namespace;
    this.endString = '}())';
    this.paths = options.paths;
    this.compilerFunction = options.compile;
    this.namespace = options.namespace;
    this.next = options.next;
};

var queue = JadeCompiler.queue = {};

JadeCompiler.prototype = {

    error: function (err) {
        this.next('ENOENT' === err.code ? null : err);
    },

    compile: function () {

        queue[this.paths.jadePath] = new EventEmitter();

        fs.readFile(this.paths.jadePath, 'utf8', function (err, jadeString) {

            if (err) {
                return this.error(err);
            }

            var script = jade.compileClient(jadeString),
                name = pathUtil.basename(this.paths.jadePath).match(/^[^.]+/)[0].replace(/[^\w\d$_]/g,"_");

            script = '.' + name + ' = ' + script;

            this.string = this.startString + script + this.endString;

            fs.writeFile(this.paths.jsPath, this.string, function (err) {

                if (err) {
                    return this.error(err);
                }

                delete templateCompiled[this.paths.jsPath];
                templateCompiled[this.paths.jsPath] = true;

                queue[this.paths.jadePath].emit('end');
                delete queue[this.paths.jadePath];

                this.next();

            }.bind(this));

        }.bind(this));
    }
};

module.exports.middleware = function middleware(options) {

    var src,
        compilerFunction,
        namespace;

    options = options || {};
    namespace = options.namespace || 'jadeTemplates';

    // Source dir required
    src = options.src;

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
                jsPath: join(src, path),
                jadePath: join(src, path.replace('.js', '.jade'))
            };
            compiler = new JadeCompiler({
                paths: paths,
                compile: compilerFunction,
                namespace: namespace,
                next: next
            });

            // Hang the request until the previous has been processed
            if (queue[paths.jadePath]) {
                return queue[paths.jadePath].on('end', next);
            }

            // Re-compile on server restart, disregarding
            // mtimes since we need to map templateCompiled
            if (!templateCompiled[paths.jsPath]) {
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