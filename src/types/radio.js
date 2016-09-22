import m from "mithril";
import assign from "lodash.assign";

import css from "./radio.css";
import multiple from "./lib/multiple";

export default multiple({
        multiple : false
    },
        
    function(vnode, children) {
        var field = vnode.attrs.field;

        return (children || []).map(function(opt) {
            return m("label", { class : css.choice },
                m("input", assign({}, opt.attrs, {
                    // attrs
                    type    : "radio",
                    name    : field.name,
                    value   : opt.value,
                    checked : opt.selected,

                    required : vnode.attrs.required,

                    // events
                    onchange : function() {
                        vnode.state.value(vnode.attrs, opt.key, opt.value);
                    }
                })),
                " " + opt.name
            );
        });
    }
);
