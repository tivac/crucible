/* global crucible */
"use strict";

var db     = require("./lib/firebase"),
    routes = require("./routes");

// Don't actually want the exports, just want it bundled
require("./global.css");

// TESTING
window.redux = require("./state");

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


