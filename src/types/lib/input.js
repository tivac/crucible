import m from "mithril";
import assign from "lodash.assign";
import get from "lodash.get";

import id from "./id";
import label from "./label";

import css from "./types.css";

export default function(type) {
    return {
        oninit : function(vnode) {
            var ctrl = this,
                val  = get(vnode.attrs.field, "attrs.value");
                
            ctrl.id = id(vnode.attrs);
            
            // tivac/crucible#96
            // If this is a new item (never been updated) set the default value
            // Don't want to use that value on every render because it is bad UX,
            // the user becomes unable to clear out the field
            if(val && vnode.attrs.root) {
                vnode.attrs.root.child("updated_at").on("value", function(snap) {
                    if(snap.exists()) {
                        return;
                    }
                    
                    vnode.attrs.update(vnode.attrs.path, val);
                    
                    m.redraw();
                });
            }
        },

        view : function(vnode) {
            var field  = vnode.attrs.field;
            
            return m("div", { class : vnode.attrs.class },
                label(vnode.state, vnode.attrs),
                m("input", assign({}, field.attrs || {}, {
                        // attrs
                        id       : vnode.state.id,
                        name     : field.name,
                        type     : type || "text",
                        class    : css[type || "text"],
                        value    : vnode.attrs.data || "",
                        required : vnode.attrs.required,

                        // events
                        oninput : m.withAttr("value", vnode.attrs.update(vnode.attrs.path))
                    }
                ))
            );
        }
    };
}
