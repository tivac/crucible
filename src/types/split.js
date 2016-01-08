"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    children     = require("./children"),
    instructions = require("./instructions"),
    css          = require("./split.css");

module.exports = {
    // Ignore this component in the data hierarchy
    decorative : true,

    view : function(ctrl, options) {
        var details = options.details;

        return m("div", { class : css.container },
            details.instructions ? m.component(instructions, { details : details.instructions }) : null,
            (details.children || []).map(function(section) {
                return m("div", { class : css.section },
                    m.component(children, {
                        details : section.children,
                        data    : options.data,
                        root    : options.root,
                        ref     : options.ref && options.ref
                    })
                );
            })
        );
    }
};
