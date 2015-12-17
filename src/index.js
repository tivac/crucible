/* global crucible */
"use strict";

// Don't actually want the exports, just want it bundled
require("./global.css");

var m = require("mithril");

m.route.mode = "pathname";

require("./routes")[global.crucible ? "default" : "setup"]();
