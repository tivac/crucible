"use strict";

var m = require("mithril"),
    
    config = require("./config");

// Don't actually want the exports, just want them bundled
require("./_global.css");
require("./_pure.css");

// Always route in pathname mode
m.route.mode = "pathname";

if(!config.firebase) {
    require("./routes/setup");
} else {
    require("./routes/default");
}
