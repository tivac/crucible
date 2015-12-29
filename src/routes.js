"use strict";

var m = require("mithril"),
    
    auth = require("./lib/require-auth");

exports.default = function() {
    m.route(document.body, "/", {
        "/" : auth(require("./pages/home")),
        
        "/login"  : require("./pages/login"),
        "/logout" : require("./pages/logout"),

        "/schema/new" : auth(require("./pages/schema-new")),

        "/content/:schema"      : auth(require("./pages/content")),
        "/content/:schema/edit" : auth(require("./pages/schema-edit")),
        "/content/:schema/:id"  : auth(require("./pages/content-edit"))
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
