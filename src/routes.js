"use strict";

var m = require("mithril"),

    auth = require("./lib/require-auth");

m.route.mode = "pathname";

exports.default = function() {
    m.route(document.body, "/", {
        "/" : auth(require("./pages/home")),

        "/login"  : require("./pages/login"),
        "/logout" : require("./pages/logout"),

        "/content/new" : auth(require("./pages/schema-new")),

        "/content/:schema"      : auth(require("./pages/content")),
        "/content/:schema/edit" : auth(require("./pages/schema-edit")),
        "/content/:schema/:id"  : auth(require("./pages/content-edit")),

        "/content/:schema/:id/history"          : auth(require("./pages/content-history")),
        "/content/:schema/:id/history/:version" : auth(require("./pages/content-history-view"))
    });
};

exports.unauth = function() {
    m.route(document.body, "/login", {
        "/login" : require("./pages/login")
    });
};

exports.setup = function() {
    m.route(document.body, "/setup", {
        "/setup" : require("./pages/setup")
    });
};
