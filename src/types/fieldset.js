"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    hide = require("./lib/hide"),
    
    children = require("./children"),
    css      = require("./fieldset.css");

module.exports = {
    view : function(ctrl, options) {
        var hidden = hide(options);
        
        if(hidden) {
            return hidden;
        }
        
        return m("fieldset", { class : options.class },
            options.details.name ? m("legend", { class : css.legend }, options.details.name) : null,
            m.component(children, assign({}, options, {
                details : options.details.children
            }))
        );
    }
};
