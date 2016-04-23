var m      = require("mithril"),
    assign = require("lodash.assign");

import css from "./radio.css";
import multiple from "./lib/multiple";

export default multiple({
        multiple : false
    },
        
    function(ctrl, options) {
        var field = options.field;
        
        return (field.children || []).map(function(opt) {
            return m("label", { class : css.choice },
                m("input", assign({}, opt.attrs, {
                    // attrs
                    type    : "radio",
                    name    : field.name,
                    value   : opt.value,
                    checked : opt.checked,

                    // events
                    onchange : function() {
                        ctrl.value(options, opt.key, opt.value);
                    }
                })),
                " " + opt.name
            );
        });
    }
);
