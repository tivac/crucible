import m from "mithril";
import assign from "lodash.assign";
import get from "lodash.get";

import id from "./lib/id";
import label from "./lib/label";

import css from "./textarea.css";

export function controller(options) {
    var ctrl = this;

    ctrl.id   = id(options);
    ctrl.text = options.data || "";

    ctrl.resize = function(opt, value) {
        opt.update(opt.path, value);

        ctrl.text = value;
    };
}

export function view(ctrl, options) {
    var field  = options.field;

    return m("div", { class : options.class },
        label(ctrl, options),
        m("div", { class : css.expander },
            m("pre", { class : css.shadow }, m("span", ctrl.text), m("br")),
            m("textarea", assign({
                    // attrs
                    id       : ctrl.id,
                    class    : css.textarea,
                    required : options.required,

                    // events
                    oninput : m.withAttr("value", ctrl.resize.bind(null, options))
                },
                field.attrs || {}
            ), options.data || "")
        )
    );
}
