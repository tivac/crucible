import m from "mithril";
import assign from "lodash.assign";

import id from "./id";
import label from "./label";

/**
 * Examples of `multiple` types include `checkbox.js` and `radio.js`,
 * in both cases you're very likely or certain to have multiple inputs 
 * defined in a single field definition. (See README for examples.)
 */

export default function(args, view) {
    return {
        oninit: function(options) {
            var ctrl = this;

            ctrl.id = id(options.attrs);

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

        view : function(vnode) {
            var children = vnode.state.selected(vnode.attrs);
            
            return m("div", { class : vnode.attrs.class },
                label(vnode.state, vnode.attrs, children),
                view(vnode.state, vnode.attrs, children)
            );
        }
    };
}
