"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    get    = require("lodash.get"),

    hide  = require("./hide"),
    id    = require("./id"),
    label = require("./label"),
    
    css = require("./types.css");

module.exports = function(type) {
    return {
        controller : function(options) {
            var ctrl = this,
                val  = get(options.field, "attrs.value");
                
            ctrl.id = id(options);
            
            // tivac/crucible#96
            // If this is a new item (never been updated) set the default value
            // Don't want to use that value on every render because it is bad UX,
            // the user becomes unable to clear out the field
            if(val) {
                options.root.child("updated_at").on("value", function(snap) {
                    if(snap.exists()) {
                        return;
                    }
                    
                    options.update(options.path, val);
                    
                    m.redraw();
                });
            }
        },

        view : function(ctrl, options) {
            var field  = options.field,
                hidden = hide(options);

            if(hidden) {
                return hidden;
            }
            
            return m("div", { class : options.class },
                label(ctrl, options),
                m("input", assign({}, field.attrs || {}, {
                        // attrs
                        id       : ctrl.id,
                        type     : type || "text",
                        class    : css[type || "text"],
                        value    : options.data || "",
                        required : field.required ? "required" : null,

                        // events
                        oninput : m.withAttr("value", options.update(options.path))
                    }
                ))
            );
        }
    };
};
