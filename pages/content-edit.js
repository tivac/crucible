"use strict";

var m = require("mithril"),
    
    fields = require("../fields"),
    db     = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl = this,
            id   = m.route.param("id"),
            
            entry  = db.child("content/" + id),
            name   = entry.child("name"),
            
            // Will be filled out once the entry has loaded
            type;
        
        ctrl.id     = id;
        ctrl.entry  = null;
        ctrl.type   = null;
        
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
        
        ctrl.namechange = name.set.bind(name);
    },

    view : function(ctrl) {
        if(!ctrl.entry || !ctrl.type || !Object.keys(ctrl.fields).length) {
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
            m("div",
                m("label",
                    "Name: ",
                    m("input", { value : ctrl.entry.name, oninput : m.withAttr("value", ctrl.namechange) })
                )
            ),
            
            m("hr"),
            
            Object.keys(ctrl.type.fields).map(function(key) {
                var field = ctrl.type.fields[key];
                
                return m.component(fields[field.type].display, {
                    field : db.child("types/" + ctrl.entry.type + "/fields/" + key),
                    data  : db.child("content/" + ctrl.id + "/data/" + key)
                });
            })
        ];
    }
};
