import m from "mithril";
import assign from "lodash.assign";

import * as children from "./children.js";

import css from "./fieldset.css";

export function view(ctrl, options) {   
    return m("fieldset", { class : options.class },
        options.field.name ? m("legend", { class : css.legend }, options.field.name) : null,
        m(children, assign({}, options, {
            fields : options.field.children
        }))
    );
}
