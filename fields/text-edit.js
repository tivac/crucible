"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    db      = require("../lib/firebase"),
    loading = require("./loading");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            ref  = options.ref;
        
        ctrl.update = function(name, val) {
            var args = {};
            
            ref.child("updated").set(db.TIMESTAMP);
            
            if(!val) {
                return ref.child(name).remove();
            }
            
            args[name] = val;
            
            ref.update(args);
        }
    },

    view : function(ctrl, options) {
        var field = options.field;

        return m("ul",
            m("li",
                m("label",
                    "Name: ",
                    m("input", {
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "name")),
                        value   : field.name || "",
                        config  : function(el, init) {
                            if(init) {
                                return;
                            }
                            
                            el.select();
                        }
                    })
                )
            ),
            m("li",
                m("label",
                    "Placeholder: ",
                    m("input", {
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "placeholder")),
                        value   : field.placeholder || ""
                    })
                )
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", ctrl.update.bind(ctrl, "disabled")),
                        checked : field.disabled || false
                    }),
                    " Disabled"
                )
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", ctrl.update.bind(ctrl, "readonly")),
                        checked : field.readonly || false
                    }),
                    " Read-Only"
                )
            )
        );
    }
};
