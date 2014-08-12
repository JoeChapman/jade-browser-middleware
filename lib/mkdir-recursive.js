'use strict';

var fs = require('node-fs'),
    pathUtil = require('path');

module.exports = function mkdirRecursive(dir) {
    var pathName = pathUtil.dirname(dir);
    if (!fs.exists(pathName)) {
        fs.mkdirSync(pathName, '0777', true);
    }
    return dir;
};
