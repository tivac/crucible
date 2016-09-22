import m from "mithril";

import css from "./instructions.css";

export default {
    view : function(vnode) {
        var field  = vnode.attrs.field;

        return m("div", { class : vnode.attrs.class },
            field.head ? m("p", { class : css.head }, field.head) : null,
            field.body ? m("p", field.body) : null
        );
    }
};
