import m from "mithril";

import css from "./checkbox.css";
import multiple from "./lib/multiple";

export default multiple({
        multiple : true
    },
    
    // View function
    function(vnode, children) {
        var field = vnode.attrs.field;
        
        return (children || []).map(function(opt) {
            return m("label", { class : css.checkbox },
                m("input", {
                    // attrs
                    type    : "checkbox",
                    name    : field.name,
                    value   : opt.value,
                    checked : opt.selected,

                    required : vnode.attrs.required,

                    // events
                    onchange : m.withAttr("checked", function(state) {
                        vnode.state.value(vnode.attrs, opt.key, state && opt.value);
                    })
                }),
                " " + opt.name
            );
        });
    }
);
