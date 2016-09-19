import m from "mithril";
import assign from "lodash.assign";
import get from "lodash.get";

import css from "./select.css";
import multiple from "./lib/multiple.js";

export default multiple({
        multiple : false
    },

    function(ctrl, options, children) {
        var field = options.field;


        return m("select", assign({
                // attrs
                class    : css.select,
                required : options.required,

                // events
                onchange : function(e) {
                    var tgt = e.target,
                        opt = children[tgt.selectedIndex];

                    ctrl.value(options, opt.key, opt.value);
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
