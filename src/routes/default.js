"use strict";

var m    = require("mithril"),
    keys = require("lodash.mapkeys"),
    
    prefix = require("../lib/prefix"),
    auth   = require("../lib/require-auth");

m.route(document.body, prefix("/"), keys({
    "/" : auth(require("../pages/home")),

    "/login"  : require("../pages/login"),
    "/logout" : require("../pages/logout"),

    "/content/new" : auth(require("../pages/schema-new")),

    "/content/:schema"      : auth(require("../pages/content-edit/")),
    "/content/:schema/edit" : auth(require("../pages/schema-edit/")),
    "/content/:schema/:id"  : auth(require("../pages/content-edit/")),
    
    "/..." : {
        view : function() {
            return m("h1", "404");
        }
    }
}, function(value, key) {
    return prefix(key);
}));
