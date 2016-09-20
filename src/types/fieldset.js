import m from "mithril";
import assign from "lodash.assign";

import * as children from "./children.js";

import css from "./fieldset.css";

export default {
    view : function(ctrl, options) {   
        return m("fieldset", { class : options.class },
            options.field.name ? m("legend", { class : css.legend }, options.field.name) : null,
            m.component(children, assign({}, options, {
                fields : options.field.children
            }))
        );
    }
};
