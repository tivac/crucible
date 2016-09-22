import m from "mithril";
import assign from "lodash.assign";

import * as children from "./children";
import * as instructions from "./instructions";

import css from "./split.css";

export default {
    view : function(vnode) {
        var field  = vnode.attrs.field;
        
        return m("div", { class : css.container },
            field.instructions ? m(instructions, { field : field.instructions }) : null,
            (field.children || []).map(function(section) {
                return m("div", { class : css.section },
                    m(children, assign({}, vnode.attrs, {
                        // Don't want to repeat any incoming class that children might've passed in
                        class  : false,
                        fields : section.children
                    }))
                );
            })
        );
    }
};
