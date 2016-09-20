import m from "mithril";
import assign from "lodash.assign";

import id from "./lib/id";
import label from "./lib/label";

import css from "./textarea.css";

export default {
    controller : function(options) {
        var ctrl = this;

        ctrl.id   = id(options);
        ctrl.text = options.data || "";

        ctrl.resize = function(opt, value) {
            opt.update(opt.path, value);

            ctrl.text = value;
        };
    },

    view : function(ctrl, options) {
        var field  = options.field;

        return m("div", { class : options.class },
            label(ctrl, options),
            m("div", { class : css.expander },
                m("pre", { class : css.shadow }, m("span", ctrl.text), m("br")),
                m("textarea", assign({
                        // attrs
                        id       : ctrl.id,
                        class    : css.textarea,
                        required : field.required ? "required" : null,

                        // events
                        oninput : m.withAttr("value", ctrl.resize.bind(null, options))
                    },
                    field.attrs || {}
                ), options.data || "")
            )
        );
    }
}
