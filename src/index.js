"use strict";

var db     = require("./lib/firebase"),
    routes = require("./routes");

// Don't actually want the exports, just want it bundled
require("./global.css");

// IIFE so I can return w/o complaints from ESLint
(function() {
    if(!global.crucible) {
        global.crucible = {};
    }
    
    if(!global.crucible.root) {
        global.crucible.root = "";
    }
    
    if(!global.crucible.firebase) {
        return routes.setup();
    }

    routes.default();
}());
