import m from "mithril";

import css from "./instructions.css";

export function view(ctrl, options) {
    var field  = options.field;

    console.log("instructions options.class", options.class);
    return m("div", { class : options.class },
        field.head ? m("p", { class : css.head }, field.head) : null,
        field.body ? m("p", field.body) : null
    );
}
