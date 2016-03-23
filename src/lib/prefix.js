"use strict";

var join = require("url-join"),
    
    config = require("../config");

module.exports = function path(str) {
    return join(config.root, str);
};
