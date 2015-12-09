"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    children     = require("./children"),
    instructions = require("./instructions"),
    css          = require("./split.css");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("div", { class : css.container.join(" ") },
            details.instructions ? m.component(instructions, { details : details.instructions }) : null,
            (details.children || []).map(function(section) {
                return m("div", { class : css.section.join(" ") },
                    m.component(children, {
                        details : section.children
                        // TODO: figure out how refs/data work here
                        // ref     : options.ref && options.ref.child
                        // data    : options.data
                    })
                );
            })
        );
    }
};
