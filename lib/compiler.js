'use strict';

var jade = require('jade'),
    mkdirRecursive = require('./mkdir-recursive'),
    formatters = require('../formatters/'),
    EventEmitter = require('events').EventEmitter,
    fs = require('fs'),
    pathUtil = require('path');

var Compiler;

module.exports = Compiler = function Compiler(options) {
    this.startString = '(function (window) { \n';
    this.nsString = 'window.' + options.namespace + ' = window.' + options.namespace + ' || {}; \n' + 'window.' + options.namespace + '.';
    this.endString = '}(window));';
    this.paths = options.paths;
    this.compilerFunction = options.compile;
    this.namespace = options.namespace;
    this.next = options.next;
    this.format = options.format;
};

Compiler.templates = {};
Compiler.queue = {};

Compiler.prototype = {

    error: function compilerError(err) {
        this.next('ENOENT' === err.code ? null : err);
    },

    compile: function compile() {

        // create a new emitter with this jade path
        Compiler.queue[this.paths.jadePath] = new EventEmitter();

        fs.readFile(this.paths.jadePath, 'utf8', function (err, jadeString) {
            if (err) return this.error(err);

            // compile string and pass in filename so Jade can proplery extend
            var script = jade.compileClient(jadeString, { filename: this.paths.jadePath }),
                // format name
                name = formatters[this.format](pathUtil.basename(this.paths.jadePath).match(/^[^.]+/)[0]);

            script = name + ' = ' + script;
            this.string = this.startString + this.nsString + script + this.endString;

            fs.writeFile(mkdirRecursive(this.paths.jsPath), this.string, function (err) {
                if (err) return this.error(err);

                delete Compiler.templates[this.paths.jsPath];
                Compiler.templates[this.paths.jsPath] = true;

                // Notify the middleware that this request has finished
                // and delete the path
                Compiler.queue[this.paths.jadePath].emit('end');
                delete Compiler.queue[this.paths.jadePath];

                this.next();
            }.bind(this));
        }.bind(this));
    }
};
