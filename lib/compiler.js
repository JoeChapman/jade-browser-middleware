'use strict';

var jade = require('jade'),
    mkdirRecursive = require('./mkdir-recursive'),
    EventEmitter = require('events').EventEmitter,
    fs = require('fs'),
    pathUtil = require('path'),
    templateCompiled,
    queue;

function JadeCompiler(options) {
    this.startString = '(function (window) { \n';
    this.nsString = 'window.' + options.namespace + ' = window.' + options.namespace + ' || {}; \n' + 'window.' + options.namespace + '.';
    this.endString = '}(window));';
    this.paths = options.paths;
    this.compilerFunction = options.compile;
    this.namespace = options.namespace;
    this.next = options.next;
}

templateCompiled = JadeCompiler.templateCompiled = {};
queue = JadeCompiler.queue = {};

JadeCompiler.prototype = {

    error: function (err) {
        this.next('ENOENT' === err.code ? null : err);
    },

    compile: function () {

        queue[this.paths.jadePath] = new EventEmitter();

        fs.readFile(this.paths.jadePath, 'utf8', function (err, jadeString) {

            if (err) { return this.error(err); }

            var script = jade.compileClient(jadeString),
                name = pathUtil.basename(this.paths.jadePath).match(/^[^.]+/)[0].replace(/[^\w\d$_]/g, '_');

            script = name + ' = ' + script;

            this.string = this.startString + this.nsString + script + this.endString;

            fs.writeFile(mkdirRecursive(this.paths.jsPath), this.string, function (err) {

                if (err) { return this.error(err); }

                delete templateCompiled[this.paths.jsPath];
                templateCompiled[this.paths.jsPath] = true;

                queue[this.paths.jadePath].emit('end');
                delete queue[this.paths.jadePath];

                this.next();
            }.bind(this));
        }.bind(this));
    }
};

module.exports = JadeCompiler;
