'use strict';

module.exports = function underscore(str) {
    return str.match(/^[^.]+/)[0].replace(/[^\w\d$_]/g, '_');
};
