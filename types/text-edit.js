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
            ref.child(path).set(val);
            options.root.child("updated").set(db.TIMESTAMP);
        };
    },

    view : function(ctrl, options) {
        var details = options.details;
        
        return m("ul",
            m("li",
                m("label",
                    "Name: ",
                    m("input", {
                        value   : details.name || "",
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "name")),
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
                        value   : details.attrs.placeholder || ""
                    })
                )
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", ctrl.update.bind(ctrl, "attrs/disabled")),
                        checked : details.attrs.disabled || false
                    }),
                    " Disabled"
                )
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", ctrl.update.bind(ctrl, "attrs/readonly")),
                        checked : details.attrs.readonly || false
                    }),
                    " Read-Only"
                )
            )
        );
    }
};
