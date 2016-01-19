"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    hide = require("./lib/hide"),

    children     = require("./children"),
    instructions = require("./instructions"),
    css          = require("./split.css");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details,
            hidden  = hide(options);
            
        if(hidden) {
            return hidden;
        }
        
        return m("div", { class : css.container },
            details.instructions ? m.component(instructions, { details : details.instructions }) : null,
            (details.children || []).map(function(section) {
                return m("div", { class : css.section },
                    m.component(children, assign({}, options, {
                        // Don't want to repeat any incoming class that children might've passed in
                        class   : false,
                        details : section.children
                    }))
                );
            })
        );
    }
};
