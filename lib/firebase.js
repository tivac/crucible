"use strict";

var Firebase = require("firebase");

module.exports = new Firebase(localStorage.getItem("crucible-root"));

// For debugging
global.firebase = module.exports;
