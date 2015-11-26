"use strict";

var Firebase = require("firebase");

module.exports = new Firebase(localStorage.getItem("crucible-root"));
