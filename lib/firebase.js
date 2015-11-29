"use strict";

var Firebase = require("firebase");

module.exports = new Firebase(localStorage.getItem("crucible-root"));
module.exports.TIMESTAMP = Firebase.ServerValue.TIMESTAMP;

// For debugging
global.firebase = module.exports;
