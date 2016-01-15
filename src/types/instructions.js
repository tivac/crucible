"use strict";

var m = require("mithril"),

    hide = require("./lib/hide"),

    css = require("./instructions.css");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details,
            hidden  = hide(options);
        
        if(hidden) {
            return hidden;
        }

        return m("div", { class : options.class },
            details.head ? m("p", { class : css.head }, details.head) : null,
            details.body ? m("p", details.body) : null
        );
    }
};
