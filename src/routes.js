"use strict";

var m = require("mithril");

exports.default = function() {
    m.route(document.body, "/", {
        "/" : require("./pages/home"),
        
        "/login"  : require("./pages/login"),
        "/logout" : require("./pages/logout"),

        "/schemas"     : require("./pages/schemas"),
        "/schemas/new" : require("./pages/schemas-new"),
        "/schemas/:id" : require("./pages/schemas-edit"),

        "/content"             : require("./pages/content"),
        "/content/:schema/:id" : require("./pages/content-edit")
    });
};

exports.setup = function() {
    m.route(document.body, "/setup", {
        "/setup" : require("./pages/setup")
    });
};
