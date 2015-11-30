"use strict";

var m = require("mithril");

m.route.mode = "pathname";
m.route(document.body, "/", {
    "/"            : require("./pages/home"),
    "/types"       : require("./pages/types"),
    "/types/new"   : require("./pages/types-new"),
    "/types/:id"   : require("./pages/types-edit"),
    "/content"     : require("./pages/content"),
    "/content/new" : require("./pages/content-new"),
    "/content/:id" : require("./pages/content-edit")
});
