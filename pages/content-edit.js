"use strict";

var m = require("mithril"),
    
    fields = require("../fields"),
    db     = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl = this,
            id   = m.route.param("id"),
            
            entry  = db.child("content/" + id);
        
        ctrl.id    = id;
        ctrl.entry = null;
        ctrl.type  = null;
        
        entry.on("value", function(snap) {
            ctrl.entry = snap.val();
            
            if(!ctrl.entry.data) {
                ctrl.entry.data = {};
            }
            
            db.child("types/" + ctrl.entry.type).on("value", function(snap) {
                ctrl.type = snap.val();
                
                m.redraw();
            });
            
            m.redraw();
        });
        
        ctrl.namechange = function(name) {
            ctrl.entry.name = name;
        };
        
        ctrl.fieldchange = function(key, value) {
            ctrl.entry.data[key] = value;
        };
        
        ctrl.onsubmit = function(e) {
            e.preventDefault();
            
            ctrl.entry.updated = db.TIMESTAMP;
            
            entry.update(ctrl.entry);
        };
    },

    view : function(ctrl) {
        if(!ctrl.entry || !ctrl.type) {
            return m("h1", "Loading...");
        }
        
        return [
            m("h1", "Content - Editing \"" + ctrl.entry.name + "\""),
            
            m("div",
                m("label",
                    "Type: ",
                    m("a", { href : "/types/" + ctrl.entry.type, config : m.route }, ctrl.type.name)
                )
            ),
            m("form", { onsubmit : ctrl.onsubmit },
                m("div",
                    m("label",
                        "Name: ",
                        m("input", { value : ctrl.entry.name, oninput : m.withAttr("value", ctrl.namechange) })
                    )
                ),
                
                m("hr"),
                
                Object.keys(ctrl.type.fields).map(function(key) {
                    var field = ctrl.type.fields[key];
                    
                    return m("div",
                        m.component(fields[field.type].display, {
                            field    : db.child("types/" + ctrl.entry.type + "/fields/" + key),
                            data     : ctrl.entry.data[key],
                            callback : ctrl.fieldchange.bind(ctrl, key)
                        })
                    );
                }),
                
                m("hr"),
                
                m("input[type=submit]", { value : "Update" })
            )
        ];
    }
};
