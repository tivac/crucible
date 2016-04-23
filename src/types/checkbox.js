var m = require("mithril");

import css from "./checkbox.css";
import multiple from "./lib/multiple";

export default multiple({
        multiple : true
    },
    
    // View function
    function(ctrl, options) {
        var field = options.field;
        
        return (field.children || []).map(function(opt) {
            return m("label", { class : css.checkbox },
                m("input", {
                    // attrs
                    type    : "checkbox",
                    name    : field.name,
                    value   : opt.value,
                    checked : opt.selected,

                    // events
                    onchange : m.withAttr("checked", function(state) {
                        ctrl.value(options, opt.key, state && opt.value);
                    })
                }),
                " " + opt.name
            );
        });
    }
);
