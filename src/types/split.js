var m      = require("mithril"),
    assign = require("lodash.assign");

import hide from "./lib/hide";

import children     from "./children";
import instructions from "./instructions";
import css          from "./split.css";

module.exports = {
    view : function(ctrl, options) {
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
