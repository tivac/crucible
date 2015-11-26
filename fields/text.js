"use strict";

var m        = require("mithril"),
    Firebase = require("firebase"),
    assign   = require("lodash.assign"),
    
    db = new Firebase("https://blazing-torch-6027.firebaseio.com");

module.exports = {
    display : {
        controller : function(options) {
            var ctrl = this,
                field = db.child("field/" + options.id),
                data  = db.child("data/" + options.id);

            ctrl.field = null;
            ctrl.data  = {
                value : ""
            };
            
            field.on("value", function(snap) {
                ctrl.field = snap.val();
            });

            data.on("value", function(snap) {
                ctrl.data = snap.val();
            });

            ctrl.oninput = function(value) {
                data.update({
                    value : value
                });
            };
        },

        view : function(ctrl) {
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

            ctrl.field = null;
            
            field.on("value", function(snap) {
                ctrl.field = snap.val();
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
                    readonly : disabled
                });
            };
        },

        view : function(ctrl) {
            if(!ctrl.field) {
                return m("span", "Loading...");
            }

            return m("div",
                m("input", assign({}, ctrl.field)),
                m("ul",
                    m("li",
                        m("label",
                            m("input", {
                                oninput : m.withAttr("value", ctrl.nameChange),
                                value   : ctrl.field.name
                            }),
                            "Name"
                        )
                    ),
                    m("li",
                        m("label",
                            m("input[type=checkbox]", {
                                onclick : m.withAttr("checked", ctrl.disabledChange),
                                checked : ctrl.field.disabled
                            }),
                            "Disabled"
                        )
                    ),
                    m("li",
                        m("label",
                            m("input[type=checkbox]", {
                                onclick : m.withAttr("checked", ctrl.readonlyChange),
                                checked : ctrl.field.readonly
                            }),
                            "Read-Only"
                        )
                    ),
                    m("li",
                        m("label",
                            m("input", {
                                oninput : m.withAttr("value", ctrl.placeholderChange),
                                value   : ctrl.field.placeholder
                            }),
                            "Placeholder"
                        )
                    )
                )
            );
        }
    }
};
