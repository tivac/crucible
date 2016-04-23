var m = require("mithril");

import hide from "./lib/hide";

import css from "./instructions.css";

module.exports = {
    view : function(ctrl, options) {
        var field  = options.field,
            hidden = hide(options);
        
        if(hidden) {
            return hidden;
        }

        return m("div", { class : options.class },
            field.head ? m("p", { class : css.head }, field.head) : null,
            field.body ? m("p", field.body) : null
        );
    }
};
