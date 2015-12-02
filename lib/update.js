"use strict";

module.exports = function(ref, path, val) {
    ref.child(path).set(val);
};
