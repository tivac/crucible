import m from "mithril";

import id from "./id";
import hide from "./hide";
import label from "./label";

export default function(args, view) {
    return {
        controller : function(options) {
            var ctrl = this;

            ctrl.id = id(options);

            // Decorate children w/ their selection status
            ctrl.selected = function(opts) {
                var field  = opts.field,
                    values = opts.data,
                    matches;

                if(!values) {
                    return;
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

                field.children = field.children.map(function(opt) {
                    opt.selected = matches.indexOf(opt) > -1;

                    return opt;
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
            var hidden  = hide(options);
            
            if(hidden) {
                return hidden;
            }

            ctrl.selected(options);
            
            return m("div", { class : options.class },
                label(ctrl, options),
                view(ctrl, options)
            );
        }
    };
}
