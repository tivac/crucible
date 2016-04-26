"use strict";

var m  = require("mithril"),
    
    config = require("../config"),
    valid  = require("./valid-auth"),
    prefix = require("./prefix");

module.exports = function(component) {
    return {
        controller : function() {
            /* eslint consistent-return: 0 */
            if(config.auth && !valid()) {
                return m.route(prefix("/login") + window.location.search);
            }
        },

        view : function() {
            return m.component(component);
        }
    };
};
