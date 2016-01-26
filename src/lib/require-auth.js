"use strict";

var m  = require("mithril"),

    db = require("./firebase");

module.exports = function(component) {
    return {
        controller : function() {
            var auth = db.getAuth();
            
            // Unauthed or expired auth? BOUNCED
            if(!auth || (auth.expires * 1000) < Date.now()) {
                return m.route("/login");
            }
        },

        view : function() {
            return m.component(component);
        }
    };
};
