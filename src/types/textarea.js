import m from "mithril";
import assign from "lodash.assign";

import id from "./lib/id";
import label from "./lib/label";

import css from "./textarea.css";

export default {
    oninit : function(vnode) {
        var ctrl = this;

        ctrl.id   = id(vnode.attrs);
        ctrl.text = vnode.attrs.data || "";

        ctrl.resize = function(opt, value) {
            opt.update(opt.path, value);

            ctrl.text = value;
        };
    },

    view : function(vnode) {
        var field  = vnode.attrs.field;

        return m("div", { class : vnode.attrs.class },
            label(vnode.state, vnode.attrs),
            m("div", { class : css.expander },
                m("pre", { class : css.shadow }, m("span", vnode.state.text), m("br")),
                m("textarea", assign({
                        // attrs
                        id       : vnode.state.id,
                        name     : field.name,
                        class    : css.textarea,
                        required : vnode.attrs.required,

                        // events
                        oninput : m.withAttr("value", vnode.state.resize.bind(null, vnode.attrs))
                    },
                    field.attrs || {}
                ), vnode.attrs.data || "")
            )
        );
    }
};
