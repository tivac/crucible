"use strict";

var m  = require("mithril"),
    
    valid = require("./valid-auth"),
    route = require("../routes");

module.exports = function(component) {
    return {
        controller : function() {
            if(global.crucible.auth && !valid()) {
                return m.route(route.path("/login"));
            }
        },

        view : function() {
            return m.component(component);
        }
    };
};
