/* global crucible */
"use strict";

// Don't actually want the exports, just want it bundled
require("./global.css");

var m = require("mithril"),
    
    db     = require("./lib/firebase"),
    routes = require("./routes");

m.route.mode = "pathname";

// IIFE so I can return w/o complaints from ESLint
(function() {
    if(!global.crucible) {
        return routes.setup();
    }

    if(!db.getAuth()) {
        return routes.unauth();
    }

    routes.default();
}())
