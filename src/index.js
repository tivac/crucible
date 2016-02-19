"use strict";

var url = require("url"),
    db     = require("./lib/firebase"),
    routes = require("./routes");

// Don't actually want the exports, just want it bundled
require("./global.css");

// IIFE so I can return w/o complaints from ESLint
(function() {
    var parts = url.parse(document.baseURI);
    
    if(!global.crucible) {
        global.crucible = {};
    }
    
    global.crucible.root = parts.path === "/" ? "" : parts.path;
    global.crucible.icons = document.baseURI + "/src/icons.svg";
    
    if(!global.crucible.firebase) {
        return routes.setup();
    }

    routes.default();
}());
