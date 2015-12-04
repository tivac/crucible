"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    update = require("../lib/update");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("label", details.name + ": ",
            m("input[type=number]", assign({
                    value   : options.data || "",
                    oninput : options.ref && m.withAttr("value", update.bind(null, options.ref, null))
                },
                details.attrs || {}
            ))
        );
    }
};
