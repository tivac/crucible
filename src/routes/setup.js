"use strict";

var m    = require("mithril"),
    keys = require("lodash.mapkeys"),
    
    prefix = require("../lib/prefix");

m.route(document.body, prefix("/setup"), keys({
    "/setup" : require("../pages/setup")
}, function(value, key) {
    return prefix(key);
}));
