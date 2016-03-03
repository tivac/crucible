"use strict";

var m   = require("mithril"),
    url = require("url");

// Don't actually want the exports, just want it bundled
require("./global.css");

if(!global.crucible) {
    global.crucible = {};
}

global.crucible.root = url.parse(document.baseURI).pathname;
global.crucible.icons = document.baseURI + "gen/icons.svg";

// Always route in pathname mode
m.route.mode = "pathname";

if(!global.crucible.firebase) {
    require("./routes/setup");
} else {
    require("./routes/default");
}
