"use strict";

var m = require("mithril"),
    
    db    = require("../lib/firebase"),
    route = require("../routes");

module.exports = {
    controller : function() {
        db.unauth();
        
        m.route(route.path("/"));
    }
};
