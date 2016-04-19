

import m from "mithril";
import assign from "lodash.assign";
import css from "./select.css";

export default require("./lib/multiple")({
        multiple : false
    },

    function(ctrl, options) {
        var field = options.field;

        return m("select", assign({
                // attrs
                class : css.select,

                // events
                onchange : function(e) {
                    var tgt = e.target,
                        opt = field.children[tgt.selectedIndex];

                    ctrl.value(options, opt.key, opt.value);
                }
            }, field.attrs),
            field.children.map(function(option) {
                return m("option", assign({}, option.attrs, {
                        value : option.value,
                        selected : option.selected ? "selected" : null
                    }),
                    option.name
                );
            })
        );
    }
);
