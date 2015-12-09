"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    children = require("./children");

module.exports = {
    // Ignore this component in the data hierarchy
    ignore : true,
    
    view : function(ctrl, options) {
        return m("fieldset",
            options.details.name ? m("legend", options.details.name) : null,
            m.component(children, {
                details : options.details.children,
                data    : options.data,
                // Use the parent because fieldsets shouldn't be part of data hierarchy
                ref : options.ref && options.ref.parent()
            })
        );
    }
};
