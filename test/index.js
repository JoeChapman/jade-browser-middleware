'use strict';

describe('jade-browser-middleware', function () {

    var Compiler = require('../lib/compiler'),
        middleware = require('../'),
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
                namespace: 'templates',
                format: 'camelcase',
                next: function () {}
            };

        beforeEach(function () {
            compiler = new Compiler(options);
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

});
