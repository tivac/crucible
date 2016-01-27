/* global crucible */
"use strict";

var db     = require("./lib/firebase"),
    routes = require("./routes");

// Don't actually want the exports, just want it bundled
require("./global.css");

// Ensure that promises exist
if(!window.Promise) {
    window.Promise = require("promiscuous");
}

// IIFE so I can return w/o complaints from ESLint
(function() {
    if(!global.crucible) {
        return routes.setup();
    }

    if(!db.getAuth()) {
        return routes.unauth();
    }

    routes.default();
}());
