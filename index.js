"use strict";

var m = require("mithril"),
    root = localStorage.getItem("crucible-root");

m.route.mode = "pathname";
m.route(document.body, "/", {
    "/"            : require("./pages/home"),
    "/setup"       : require("./pages/setup"),
    "/types"       : require("./pages/types.js"),
    "/types/new"   : require("./pages/types-new.js"),
    "/types/:id"   : require("./pages/types-edit.js")
});

if(!root) {
    m.route("/setup");
}
