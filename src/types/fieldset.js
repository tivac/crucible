var m      = require("mithril"),
    assign = require("lodash.assign");
    
import hide from "./lib/hide.js";

import * as children from "./children.js";

import css from "./fieldset.css";

export function view(ctrl, options) {
    var hidden  = hide(options);
    
    if(hidden) {
        return hidden;
    }
    
    return m("fieldset", { class : options.class },
        options.field.name ? m("legend", { class : css.legend }, options.field.name) : null,
        m.component(children, assign({}, options, {
            fields : options.field.children
        }))
    );
}
