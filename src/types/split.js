import m from "mithril";
import assign from "lodash.assign";

import hide from "./lib/hide";

import * as children from "./children";
import * as instructions from "./instructions";

import css from "./split.css";

export function view(ctrl, options) {
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
