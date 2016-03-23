"use strict";

var Firebase = require("firebase"),

    config = require("../config");

module.exports = new Firebase(config.firebase);
module.exports.TIMESTAMP = Firebase.ServerValue.TIMESTAMP;

// For debugging
global.firebase = module.exports;
