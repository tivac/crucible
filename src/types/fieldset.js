import m from "mithril";
import assign from "lodash.assign";

import * as children from "./children.js";

import css from "./fieldset.css";

export default {
    view : function(vnode) {   
        return m("fieldset", { class : vnode.attrs.class },
            vnode.attrs.field.name ? m("legend", { class : css.legend }, vnode.attrs.field.name) : null,
            m(children, assign({}, vnode.attrs, {
                fields : vnode.attrs.field.children
            }))
        );
    }
};
