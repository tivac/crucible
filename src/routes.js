"use strict";

var m    = require("mithril"),
    keys = require("lodash.mapkeys"),
    join = require("url-join"),

    auth = require("./lib/require-auth");

m.route.mode = "pathname";

function path(str) {
    return join(global.crucible.root, str);
}

exports.path = path;

exports.default = function() {
    m.route(document.body, path("/"), keys({
        "/" : auth(require("./pages/home")),

        "/login"  : require("./pages/login"),
        "/logout" : require("./pages/logout"),

        "/content/new" : auth(require("./pages/schema-new")),

        "/content/:schema"      : auth(require("./pages/content-edit")),
        "/content/:schema/edit" : auth(require("./pages/schema-edit")),
        "/content/:schema/:id"  : auth(require("./pages/content-edit")),
        
        "/..." : {
            view : function() {
                return m("h1", "404");
            }
        }
    }, function(value, key) {
        return path(key);
    }));
};

exports.setup = function() {
    m.route(document.body, path("/setup"), keys({
        "/setup" : require("./pages/setup")
    }, function(value, key) {
        return path(key);
    }));
};
