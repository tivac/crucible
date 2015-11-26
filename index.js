"use strict";

var m = require("mithril"),
    root = localStorage.getItem("crucible-root");

m.route.mode = "pathname";
m.route(document.body, "/", {
    "/"            : require("./pages/home"),
    "/setup"       : require("./pages/setup"),
    "/types"       : require("./pages/types"),
    "/types/new"   : require("./pages/types-new"),
    "/types/:id"   : require("./pages/types-edit"),
    "/content"     : require("./pages/content"),
    "/content/new" : require("./pages/content-new"),
    "/content/:id" : require("./pages/content-edit")
});

if(!root) {
    m.route("/setup");
}
