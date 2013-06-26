'use strict';

describe('jade-browser-middleware', function () {

    var jbm = require('../'),
        jade = require('jade'),
        fs = require('fs');

    describe('CompileJade class', function () {
        var compiler,
            options = {
                paths: {
                    jsPath: __dirname + '/dummyTemplates/t1.js',
                    jadePath: __dirname + '/dummyTemplates/t1.jade'
                },
                compilerFunction: jade.compile,
                namespace: 'NS',
                next: function () {}
            };

        beforeEach(function () {
            compiler = new jbm.JadeCompiler(options);
        });

        describe('.compile()', function () {

            it('calls writeFile with jsPath, compiled jade and callback', function (done) {

                sinon.stub(fs, 'writeFile', function (path, string, callback) {
                    fs.writeFile.should.have.been.calledWith(path, string, callback);
                    done();
                });

                compiler.compile();

            });

        });

    });

    describe('request', function () {
        var options = {
                src:  __dirname + '/dummyTemplates/',
                namespace: 'BGCH.templates'
            },
            req = {
                method: 'GET',
                url: '/templates/t1.js'
            },
            res = {},
            next = function () {},
            middleware;

        before(function () {
            middleware = jbm.middleware(options);
        });

        describe('first get templates/t1.js', function () {

            beforeEach(function () {
                delete jbm.JadeCompiler.queue[__dirname + '/dummyTemplates/t1.jade'];
                sinon.stub(jbm.JadeCompiler.prototype, 'compile');
                middleware(req, res, next);
            });

            afterEach(function () {
                jbm.JadeCompiler.prototype.compile.restore();
            });

            it('calls compile', function () {
                jbm.JadeCompiler.prototype.compile.should.have.been.called;
            });

        });

        describe('subsequent get templates/t1.js', function () {

            beforeEach(function () {
                sinon.stub(jbm.JadeCompiler.prototype, 'compile');
                middleware(req, res, next);
            });

            it('calls compile', function () {
                jbm.JadeCompiler.prototype.compile.should.have.been.called;
            });

        });
    });

});