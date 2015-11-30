"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    db      = require("../lib/firebase"),
    loading = require("./loading");

module.exports = {
    controller : function(options) {
        var ctrl  = this;
        
        ctrl.field = null;
        
        options.field.on("value", function(snap) {
            ctrl.field = snap.val();
            
            m.redraw();
        });
        
        ctrl.update = function(name, val) {
            var args = {};
            
            // This feels gross, FYI
            options.field.parent().parent().child("updated").set(db.TIMESTAMP);
            
            if(!val) {
                return options.field.child(name).remove();
            }
            
            args[name] = val;
            
            options.field.update(args);
        }
    },

    view : function(ctrl) {
        if(!ctrl.field) {
            return m.component(loading);
        }

        return m("ul",
            m("li",
                m("label",
                    "Name: ",
                    m("input", {
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "name")),
                        value   : ctrl.field.name || "",
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
                        value   : ctrl.field.placeholder || ""
                    })
                )
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", ctrl.update.bind(ctrl, "disabled")),
                        checked : ctrl.field.disabled || false
                    }),
                    " Disabled"
                )
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", ctrl.update.bind(ctrl, "readonly")),
                        checked : ctrl.field.readonly || false
                    }),
                    " Read-Only"
                )
            )
        );
    }
};
