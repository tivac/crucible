"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    types = require("./index");

module.exports = {
    view : function(ctrl, options) {
        return m("div",
            "Repeating " + options.name + ":",
            m.component(types.components.fields, {
                details : options.details.fields
                // TODO: figure out how refs/data work here
                // ref     : options.ref && options.ref.child
                // data    : options.data
            })
        );
    }
};
