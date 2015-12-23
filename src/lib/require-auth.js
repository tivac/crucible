"use strict";

var m  = require("mithril"),

    db = require("./firebase");

module.exports = function(component) {
    return {
        controller : function() {
            if(!db.getAuth()) {
                return m.route("/login");
            }
        },

        view : function() {
            return m.component(component);
        }
    };
};
