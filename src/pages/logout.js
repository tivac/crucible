"use strict";

var m = require("mithril"),
    
    db = require("../lib/firebase");

module.exports = {
    controller : function() {
        db.unauth();
        
        m.route("/login");
    }
};
