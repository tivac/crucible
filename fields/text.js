"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    db = require("../lib/firebase");

module.exports = {
    display : {
        controller : function(options) {
            var ctrl  = this,
                field = db.child("fields/" + options.id),
                data  = db.child("data/" + options.id);
            
            ctrl.field = null;
            ctrl.data  = {
                value : ""
            };
            
            field.on("value", function(snap) {
                ctrl.field = snap.val();
                
                m.redraw();
            });

            data.on("value", function(snap) {
                ctrl.data = snap.val();
                
                m.redraw();
            });

            ctrl.oninput = function(value) {
                data.update({
                    value : value
                });
            };
        },

        view : function(ctrl) {
            console.log(ctrl);
            
            if(!ctrl.field) {
                return m("span", "Loading...");
            }

            return m("label", ctrl.field.name,
                m("input", assign({}, ctrl.field, ctrl.data, {
                    oninput : m.withAttr("value", ctrl.oninput)
                }))
            );
        }
    },

    edit : {
        controller : function(options) {
            var ctrl  = this,
                field = db.child("fields/" + options.id);;
            
            ctrl.options = options;
            ctrl.field   = null;
            
            field.on("value", function(snap) {
                ctrl.field = snap.val();
                
                m.redraw();
            });

            ctrl.nameChange = function(name) {
                field.update({
                    name : name
                });
            };

            ctrl.placeholderChange = function(placeholder) {
                field.update({
                    placeholder : placeholder
                });
            };

            ctrl.disabledChange = function(disabled) {
                field.update({
                    disabled : disabled
                });
            };

            ctrl.readonlyChange = function(readonly) {
                field.update({
                    readonly : readonly
                });
            };
        },

        view : function(ctrl) {
            if(!ctrl.field) {
                return m("span", "Loading...");
            }

            return m("div",
                m.component(module.exports.display, ctrl.options),
                m("ul",
                    m("li",
                        m("label",
                            "Name",
                            m("input", {
                                oninput : m.withAttr("value", ctrl.nameChange),
                                value   : ctrl.field.name || ""
                            })
                        )
                    ),
                    m("li",
                        m("label",
                            "Placeholder",
                            m("input", {
                                oninput : m.withAttr("value", ctrl.placeholderChange),
                                value   : ctrl.field.placeholder || ""
                            })
                        )
                    ),
                    m("li",
                        m("label",
                            m("input[type=checkbox]", {
                                onclick : m.withAttr("checked", ctrl.disabledChange),
                                checked : ctrl.field.disabled || false
                            }),
                            "Disabled"
                        )
                    ),
                    m("li",
                        m("label",
                            m("input[type=checkbox]", {
                                onclick : m.withAttr("checked", ctrl.readonlyChange),
                                checked : ctrl.field.readonly || false
                            }),
                            "Read-Only"
                        )
                    )
                )
            );
        }
    }
};
