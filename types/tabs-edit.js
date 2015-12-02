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

        ctrl.addtab = function(e) {
            e.preventDefault();

            ref.child("tabs").push().setWithPriority({
                name : "Tab"
            }, 9999);
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
            m("div",
                m("p",
                    m("button", { onclick : ctrl.addtab }, "Add Tab")
                ),
                Object.keys(details.tabs || {}).map(function(key) {
                    var tab = details.tabs[key];

                    return m("div",
                        m("p",
                            m("label",
                                "Tab Name: ",
                                m("input", {
                                    value   : tab.name || "",
                                    oninput : m.withAttr("value", ctrl.update.bind(ctrl, "tabs/" + key + "/name"))
                                })
                            )
                        ),
                        m.component(types.components.collection.edit, {
                            details : tab,
                            root    : options.root,
                            ref     : options.ref.child("tabs/" + key)
                        })
                    );
                })
            )
        );
    }
};
