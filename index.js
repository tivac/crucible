"use strict";

var m = require("mithril");

m.route.mode = "pathname";
m.route(document.body, "/", {
    "/"            : require("./pages/home"),
    "/types"       : require("./pages/types.js"),
    "/types/new"   : require("./pages/types-new.js"),
    "/types/:id"   : require("./pages/types-edit.js")
});
