"use strict";

var Firebase = require("firebase"),
    
    root = localStorage.getItem("crucible-root") || global.crucible_root;

if(!root) {
    root = window.prompt("Enter your firebase URL\n\nExample:\n    https://foogawoogabooga.firebaseio.com", "");

    if(!root) {
        throw new Error("Must specify a firebase root");
    }

    localStorage.setItem("crucible-root", root);
}

module.exports = new Firebase(root);
module.exports.TIMESTAMP = Firebase.ServerValue.TIMESTAMP;

// For debugging
global.firebase = module.exports;
