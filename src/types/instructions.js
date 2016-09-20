import m from "mithril";

import css from "./instructions.css";

export default {
    view : function(ctrl, options) {
        var field  = options.field;

        return m("div", { class : options.class },
            field.head ? m("p", { class : css.head }, field.head) : null,
            field.body ? m("p", field.body) : null
        );
    }
};
