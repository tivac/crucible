"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    db = require("../lib/firebase");

function update(db, name, val) {
    var args = {};
    
    if(!val) {
        return db.child(name).remove();
    }
    
    args[name] = val;
    
    db.update(args);
}

module.exports = {
    display : {
        controller : function(options) {
            var ctrl = this;
            
            ctrl.field = {};
            
            console.log(options.field.toString());
            
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

            ctrl.nameChange        = update.bind(null, options.field, "name");
            ctrl.placeholderChange = update.bind(null, options.field, "placeholder");
            ctrl.disabledChange    = update.bind(null, options.field, "disabled");
            ctrl.readonlyChange    = update.bind(null, options.field, "readonly");
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
                            oninput : m.withAttr("value", ctrl.nameChange),
                            value   : ctrl.field.name || ""
                        })
                    )
                ),
                m("li",
                    m("label",
                        "Placeholder: ",
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
                        " Disabled"
                    )
                ),
                m("li",
                    m("label",
                        m("input[type=checkbox]", {
                            onclick : m.withAttr("checked", ctrl.readonlyChange),
                            checked : ctrl.field.readonly || false
                        }),
                        " Read-Only"
                    )
                )
            );
        }
    }
};
