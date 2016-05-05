"use strict";

var browserify = require("browserify");

module.exports = function(options) {
    var opts = options || {},
        b    = browserify("src/index.js", opts);

    // Everyone uses rollupify
    b.transform("rollupify", {
        config : require("./rollup")(opts)
    });
    
    return b;
};
