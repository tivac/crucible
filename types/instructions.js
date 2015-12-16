"use strict";

var m = require("mithril"),
    
    types = require("./types.css"),
    css   = require("./instructions.css");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("div", { class : options.class },
            details.head ? m("p", { class : css.head }, details.head) : null,
            details.body ? m("p", details.body) : null
        );
    }
};
