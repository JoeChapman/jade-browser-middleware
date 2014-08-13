'use strict';

module.exports = function camelcase(str) {
    return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
};
