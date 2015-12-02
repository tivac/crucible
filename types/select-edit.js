"use strict";

var m      = require("mithril"),
    
    db      = require("../lib/firebase"),
    loading = require("./loading");

module.exports = {
    controller : function(options) {
        var ctrl  = this;
        
        ctrl.field = null;
        
        options.field.on("value", function(snap) {
            ctrl.field = snap.val();
            
            if(!ctrl.field.options) {
                ctrl.field.options = {};
            }
            
            m.redraw();
        });
        
        ctrl.update = function(name, value) {
            var args = {};
            
            // This feels gross, FYI
            options.field.parent().parent().child("updated").set(db.TIMESTAMP);
            
            if(!value) {
                return options.field.child(name).remove();
            }
            
            args[name] = value;
            
            options.field.update(args);
        };
        
        ctrl.option = function(key, field, value) {
            var ref = options.field.child("options");
            
            // Selected is a radio button, so clear everyone else out
            if(field === "selected") {
                ref.orderByChild(field).equalTo(true).once("child_added", function(snap) {
                    if(snap.key() === key) {
                        return;
                    }
                    
                    ref.child(snap.key()).update({
                        selected : false
                    });
                });
            }
            
            ref.child(key + "/" + field).set(value);
        };
        
        ctrl.add = function(e) {
            e.preventDefault();
            
            options.field.child("options").push({
                name  : "",
                value : ""
            });
        };
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
                    "Size: ",
                    m("input[type=number][min=0][max=100][step=1]", {
                        oninput : m.withAttr("value", ctrl.update.bind(ctrl, "size")),
                        value   : ctrl.field.size || 0
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
            ),
            m("li",
                m("label",
                    m("input[type=checkbox]", {
                        onclick : m.withAttr("checked", ctrl.update.bind(ctrl, "multiple")),
                        checked : ctrl.field.multiple || false
                    }),
                    " Multiple selection allowed"
                )
            ),
            m("hr"),
            m("ul",
                Object.keys(ctrl.field.options).map(function(key) {
                    var option = ctrl.field.options[key];
                    
                    return m("li",
                        m("label",
                            "Name: ",
                            m("input", {
                                value   : option.name || "",
                                oninput : m.withAttr("value", ctrl.option.bind(ctrl, key, "name"))
                            })
                        ),
                        m("label",
                            "Value: ",
                            m("input", {
                                value   : option.value || "",
                                oninput : m.withAttr("value", ctrl.option.bind(ctrl, key, "value"))
                            })
                        ),
                        m("label",
                            m("input[type=radio]", {
                                name    : key + "-selected",
                                onclick : m.withAttr("checked", ctrl.option.bind(ctrl, key, "selected")),
                                checked : option.selected || false
                            }),
                            " Default selection?"
                        )
                    );
                })
            ),
            m("button", { onclick : ctrl.add }, "Add Option")
        );
    }
};
