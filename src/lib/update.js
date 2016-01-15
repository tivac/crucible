"use strict";

module.exports = function(ref, path, val) {
    var db;

    if(!ref) {
        return;
    }

    db = path ? ref.child(path) : ref;

    if(val === false) {
        return db.remove();
    }

    return db.set(val);
};
