"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("option", assign({
                // Default value to the name, it can be overridden
                // in attrs/value
                value : details.name
            }, details.attrs),
            details.name
        );
    }
};
