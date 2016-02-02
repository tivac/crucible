"use strict";

var m   = require("mithril"),
    set = require("lodash.set");

function firebase(ref, path, val) {
    var db = path.length ? ref.child(path.join("/")) : ref;
    
    if(val === false) {
        return db.remove();
    }
    
    return db.set(val);
};

function update(ref, obj, path, val) {
    if(!obj) {
        return;
    }
    
    if(ref) {
        firebase(ref, path, val);
    }
    
    set(obj, path, val === false ? undefined : val);
}

module.exports = function(ref, obj, path, val) {
    // Allow for easier usage by returning a function w/ bound params
    // Mostly useful in event handlers
    if(arguments.length === 3) {
        return update.bind(null, ref, obj, path);
    }
    
    return update(ref, obj, path, val);
};
