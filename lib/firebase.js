/* global crucible */
"use strict";

var Firebase = require("firebase");

module.exports = new Firebase(crucible.firebase);
module.exports.TIMESTAMP = Firebase.ServerValue.TIMESTAMP;

// For debugging
global.firebase = module.exports;
