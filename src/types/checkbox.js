import m from "mithril";

import css from "./checkbox.css";
import multiple from "./lib/multiple";

export default multiple({
        multiple : true
    },
    
    // View function
    function(ctrl, options, children) {
        var field = options.field,
            req = options.required;
        
        return (children || []).map(function(opt) {
            return m("label", { class : css.checkbox },
                m("input", {
                    // attrs
                    type    : "checkbox",
                    name    : field.name,
                    value   : opt.value,
                    checked : opt.selected,

                    required : req,

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
