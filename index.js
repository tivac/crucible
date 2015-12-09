/* global crucible */
"use strict";

// Don't actually want the exports, just want it bundled
require("./global.css");

var m = require("mithril"),
    
    routes = require("./routes");

m.route.mode = "pathname";

routes[global.crucible ? "default" : "setup"]();
