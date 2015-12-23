"use strict";

var m = require("mithril"),
    
    auth = require("./lib/require-auth");

exports.default = function() {
    m.route(document.body, "/", {
        "/" : auth(require("./pages/home")),
        
        "/login"  : require("./pages/login"),
        "/logout" : require("./pages/logout"),

        "/schemas"     : auth(require("./pages/schemas")),
        "/schemas/new" : auth(require("./pages/schemas-new")),
        "/schemas/:id" : auth(require("./pages/schemas-edit")),

        "/content"             : auth(require("./pages/content")),
        "/content/:schema"     : auth(require("./pages/content-list")),
        "/content/:schema/:id" : auth(require("./pages/content-edit"))
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
