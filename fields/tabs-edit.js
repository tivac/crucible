"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    db      = require("../lib/firebase"),
    fields  = require("./index"),
    loading = require("./loading"),

    supported;

// Can't nest tabs, that'd be gross.
supported = fields.filter(function(field) {
    return field !== "tabs";
});

module.exports = {
    controller : function(options) {
        var ctrl = this,
            ref  = options.field;
        
        ctrl.field = null;
        
        ref.on("value", function(snap) {
            ctrl.field = snap.val();

            if(ctrl.field && !ctrl.field.tabs) {
                ctrl.field.tabs = {};
            }
            
            m.redraw();
        });
        
        ctrl.update = function(name, val) {
            var args = {};
            
            // This feels gross, FYI
            ref.parent().parent().child("updated").set(db.TIMESTAMP);
            
            if(!val) {
                return ref.child(name).remove();
            }
            
            args[name] = val;
            
            ref.update(args);
        }

        ctrl.add = function(e) {
            var tab;

            e.preventDefault();

            tab = ref.child("tabs").push();

            tab.setWithPriority({
                title : "Tab"
            }, 9999);
        };

        ctrl.type = function(tab, type, e) {
            var field;

            e.preventDefault();

            field = ref.child("tabs/" + tab + "/fields").push();

            field.setWithPriority({
                type : type,
                name : type
            }, 9999);
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
                Object.keys(ctrl.field.tabs).map(function(key) {
                    var tab = ctrl.field.tabs[key];

                    return m("div",
                        m("p",
                            m("strong", "TAB: " + key)
                        ),
                        Object.keys(tab.fields || {}).map(function(fieldKey) {
                            var field = tab.fields[fieldKey];

                            return m("p", "FIELD: " + fieldKey + " TYPE: " + field.type);
                        }),
                        m("p",
                            m("strong", "Add Field: "),
                            supported.map(function(field) {
                                return m("span",
                                    m("a[href=/types/new/add-field]", { onclick : ctrl.type.bind(ctrl, key, field) }, field),
                                    " | "
                                );
                            })
                        )
                    );
                }),
                m("p",
                    m("button", { onclick : ctrl.add }, "Add Tab")
                )
            )
        );
    }
};
