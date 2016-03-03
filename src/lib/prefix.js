"use strict";

var join = require("url-join");

module.exports = function path(str) {
    return join(global.crucible.root, str);
};
