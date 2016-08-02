import m from "mithril";
import assign from "lodash.assign";

import id from "./id";
import hide from "./hide";
import label from "./label";

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
                    matches;

                if(!values) {
                    return field.children;
                }

                matches = field.children.filter(function(opt) {
                    if(!args.multiple) {
                        return opt.value === values;
                    }

                    return values[opt.key] === opt.value;
                });

                if(!args.multiple && matches.length) {
                    matches.length = 1;
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
            
            if(hidden) {
                return hidden;
            }

            children = ctrl.selected(options);
            
            return m("div", { class : options.class },
                label(ctrl, options, children),
                view(ctrl, options, children)
            );
        }
    };
}
