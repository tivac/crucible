"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        console.log(options);
        
        return m("option", {
                value : options.details || options.name
            },
            options.name
        );
    }
};
