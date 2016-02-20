"use strict";

var url = require("url"),
    db     = require("./lib/firebase"),
    routes = require("./routes");

// Don't actually want the exports, just want it bundled
require("./global.css");

// IIFE so I can return w/o complaints from ESLint
(function() {
    if(!global.crucible) {
        global.crucible = {};
    }
    
    global.crucible.root = url.parse(document.baseURI).pathname;
    global.crucible.icons = document.baseURI + "gen/icons.svg";
    
    if(!global.crucible.firebase) {
        return routes.setup();
    }

    routes.default();
}());
