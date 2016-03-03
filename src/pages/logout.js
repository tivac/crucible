"use strict";

var m = require("mithril"),
    
    db     = require("../lib/firebase"),
    prefix = require("../lib/prefix");

module.exports = {
    controller : function() {
        db.unauth();
        
        m.route(prefix("/"));
    }
};
