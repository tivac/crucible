"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("label", details.name + ": ",
            m("input[type=number]", assign(
                { value : options.data || "" },
                details.attrs || {}
            ))
        );
    }
};
