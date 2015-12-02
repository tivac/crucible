"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    loading = require("./loading");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;

        return m("label", details.name + ": ",
            m("input", assign(
                { value : options.data || "" },
                details.attrs || {}
            ))
        );
    }
};
