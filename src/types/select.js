import m from "mithril";
import assign from "lodash.assign";

import css from "./select.css";
import multiple from "./lib/multiple.js";

export default multiple({
        multiple : false
    },

    function(vnode, children) {
        var field = vnode.attrs.field;


        return m("select", assign({
                // attrs
                name     : field.name,
                class    : css.select,
                required : vnode.attrs.required,

                // events
                onchange : function(e) {
                    var tgt = e.target,
                        opt = children[tgt.selectedIndex];

                    vnode.state.value(vnode.attrs, opt.key, opt.value);
                }
            }, field.attrs),
            
            children.map(function(option) {
                return m("option", assign({}, option.attrs, {
                        value    : option.value,
                        selected : option.selected ? "selected" : null
                    }),
                    option.name
                );
            })
        );
    }
);
