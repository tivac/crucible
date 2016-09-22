import m from "mithril";
import assign from "lodash.assign";
import times from "lodash.times";
    
import { icons } from "../config";

import hide from "./lib/hide";

import * as children from "./children";

import css from "./repeating.css";

function child(vnode, data, idx) {
    return m("div", { class : css[idx === 0 ? "first" : "child"] },
        m("div", { class : css.meta },
            m("p", { class : css.counter }, idx + 1),
            m("button", {
                    class   : css.remove,
                    onclick : vnode.state.remove.bind(null, vnode.attrs, data, idx)
                },
                m("svg", { class : css.icon },
                    m("use", { "xlink:href" : icons + "#remove" })
                )
            )
        ),
        m(children, assign({}, vnode.attrs, {
            fields : vnode.attrs.field.children,
            class  : css.fields,
            data   : data,
            path   : vnode.attrs.path.concat(idx)
        }))
    );
}

export default {
    oninit : function(vnode) {
        var ctrl = this;
        
        ctrl.children = (vnode.attrs.data && vnode.attrs.data.length) || 1;
        
        ctrl.add = function(opts, e) {
            e.preventDefault();
            
            ctrl.children += 1;

            // Ensure that we have data placeholders for all the possible entries
            times(ctrl.children, function(idx) {
                if(opts.data && opts.data[idx]) {
                    return;
                }
                
                // Need a key here so that firebase will save this object,
                // otherwise future loads can have weird gaps
                opts.update(opts.path.concat(idx), { __idx : idx });
            });
        };

        ctrl.remove = function(opts, data, idx, e) {
            e.preventDefault();
            
            if(Array.isArray(opts.data)) {
                opts.data.splice(idx, 1);
                
                ctrl.children = opts.data.length;
            } else {
                --ctrl.children;
            }
            
            opts.update(opts.path, opts.data);
        };
    },

    view : function(vnode) {
        var field = vnode.attrs.field,
            items;
        
        if(vnode.attrs.data) {
            items = vnode.attrs.data.map(child.bind(null, vnode.state, vnode.attrs));
        } else {
            items = times(vnode.state.children, child.bind(null, vnode.state, vnode.attrs, false));
        }
        
        return m("div", { class : vnode.attrs.class + " " + css.container },
            items,
            m("button", {
                class   : css.add,
                onclick : vnode.state.add.bind(null, vnode.attrs)
            }, field.button || "Add")
        );
    }
};
