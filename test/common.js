'use strict';

var chai = require('chai'),
    sinonChai = require('sinon-chai');

global.sinon = require('sinon');
chai.use(sinonChai);
global.should = require('chai').should();

global.passErrorToCallback = function (cb, fn) {
    return function () {
        try { fn.apply(this, arguments); } catch (e) { cb(e); }
    };
};