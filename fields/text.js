"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    db = require("../lib/firebase");

module.exports = {
    display : {
        controller : function(options) {
            var ctrl = this;
            
            ctrl.field = {};
            
            options.field.on("value", function(snap) {
                ctrl.field = snap.val();
                
                m.redraw();
            });
            
            if(options.data) {
                options.data.on("value", function(snap) {
                    ctrl.data = snap.val();
                    
                    m.redraw();
                });
            }
            
            ctrl.oninput = function(value) {
                options.callback(value);
            };
        },

        view : function(ctrl) {
            if(!ctrl.field) {
                return m("span", "Loading...");
            }

            return m("label", ctrl.field.name + ": ",
                m("input", assign({}, ctrl.field, { value : ctrl.data || "" }, {
                    oninput : m.withAttr("value", ctrl.oninput)
                }))
            );
        }
    },

    edit : {
        controller : function(options) {
            var ctrl  = this;
            
            ctrl.field = null;
            
            options.field.on("value", function(snap) {
                ctrl.field = snap.val();
                
                m.redraw();
            });
            
            ctrl.update = function(name, val) {
                var args = {};
                
                if(!val) {
                    return options.field.child(name).remove();
                }
                
                args[name] = val;
                
                options.field.update(args);
            }
        },

        view : function(ctrl) {
            if(!ctrl.field) {
                return m("span", "Loading...");
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
    }
};
