"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    set    = require("lodash.set"),

    db     = require("../lib/firebase"),
    types = require("./index");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            ref  = options.ref;
        
        ctrl.ref = ref;

        ctrl.update = function(path, val) {
            ref.child(path).set(val);
            options.root.child("updated").set(db.TIMESTAMP);
        };
    },

    view : function(ctrl, options) {
        var details = options.details;

        return m("div",
            m("p",
                m("label",
                    "Name: ",
                    m("input", {
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "name")),
                        value   : details.name || "",
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
                    "Max: ",
                    m("input[type=number]", {
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "max")),
                        value   : details.max || ""
                    })
                )
            ),
            m.component(types.components.fields.edit, {
                details : details,
                root    : options.root,
                ref     : options.ref
            })
        );
    }
};
