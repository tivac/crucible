"use strict";

var merge = require("lodash.merge");

module.exports = function(args) {
    return merge({}, {
        state   : {},
        path    : [],
        details : {
            key : "fooga"
        },
        field : { }
    }, args || {});
};
