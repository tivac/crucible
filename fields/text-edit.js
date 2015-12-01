"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    set    = require("lodash.set"),
    
    db      = require("../lib/firebase"),
    loading = require("./loading");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            ref  = options.ref;
        
        ctrl.update = function(path, val) {
            ref.child("updated").set(db.TIMESTAMP);
            ref.child(path).set(val);
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
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "attrs/placeholder")),
                        value   : field.attrs.placeholder || ""
                    })
                )
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", ctrl.update.bind(ctrl, "attrs/disabled")),
                        checked : field.attrs.disabled || false
                    }),
                    " Disabled"
                )
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", ctrl.update.bind(ctrl, "attrs/readonly")),
                        checked : field.attrs.readonly || false
                    }),
                    " Read-Only"
                )
            )
        );
    }
};
