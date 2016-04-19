"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    hide = require("./lib/hide"),

    children     = require("./children"),
    instructions = require("./instructions"),
    css          = require("./split.css");

module.exports = {
    exports.view = function(ctrl, options) {
        var field  = options.field,
            hidden = hide(options);
            
        if(hidden) {
            return hidden;
        }
        
        return m("div", { class : css.container },
            field.instructions ? m.component(instructions, { field : field.instructions }) : null,
            (field.children || []).map(function(section) {
                return m("div", { class : css.section },
                    m.component(children, assign({}, options, {
                        // Don't want to repeat any incoming class that children might've passed in
                        class  : false,
                        fields : section.children
                    }))
                );
            })
        );
    }
};
