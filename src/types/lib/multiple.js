import m from "mithril";
import assign from "lodash.assign";

import id from "./id";
import hide from "./hide";
import label from "./label";

/**
 * Examples of `multiple` types include `checkbox.js` and `radio.js`,
 * in both cases you're very likely or certain to have multiple inputs 
 * defined in a single field definition. (See README for examples.)
 */

export default function(args, view) {
    return {
        controller : function(options) {
            var ctrl = this;

            ctrl.id = id(options);

            // Update data object w/ default status of the field (if set)

            // Figure out selected status for children
            ctrl.selected = function(opts) {
                var field  = opts.field,
                    values = opts.data,
                    matches,
                    match;

                if(!values) {
                    return field.children;
                }

                if(args.multiple) {
                    matches = field.children.filter((child) => values[child.key] === child.value);
                } else {
                    // Limit matches to one if only one can be selected (e.g. <select>, <radio>)
                    match = field.children.find((child) => child.value === values);
                    matches = [ match ];
                }

                return field.children.map(function(opt) {
                    return assign({}, opt, {
                        selected : matches.indexOf(opt) > -1
                    });
                });
            };

            ctrl.value = function(opts, key, value) {
                return opts.update(
                    args.multiple ? opts.path.concat(key) : opts.path,
                    value
                );
            };
        },

        view : function(ctrl, options) {
            var hidden = hide(options),
                children;
            
            // if(hidden) {
            //     return hidden;
            // }

            children = ctrl.selected(options);
            
            return m("div", { class : options.class },
                label(ctrl, options, children),
                view(ctrl, options, children)
            );
        }
    };
}
