"use strict";

var set   = require("lodash.set");

function update(obj, path, val) {
    if(!obj) {
        return;
    }

    set(obj, path, (val === false || val === "") ? undefined : val);
}

module.exports = function(obj, path, val) {
    // Allow for easier usage by returning a function w/ bound params
    // Mostly useful in event handlers
    if(arguments.length === 2) {
        return update.bind(null, obj, path);
    }

    return update(obj, path, val);
};
