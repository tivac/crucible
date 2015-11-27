"use strict";

var m = require("mithril"),
    
    fields = require("../fields"),
    db     = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl = this,
            id   = m.route.param("id"),
            
            entry  = db.child("content/" + id),
            data   = db.child("data"),
            name   = entry.child("name"),
            
            // Will be filled out once the entry has loaded
            type;
        
        ctrl.entry  = null;
        ctrl.type   = null;
        ctrl.fields = {};
        ctrl.data   = {};
        
        entry.on("value", function(snap) {
            ctrl.entry = snap.val();
            
            if(!ctrl.entry.data) {
                ctrl.entry.data = {};
            }
            
            db.child("types/" + ctrl.entry.type).on("value", function(snap) {
                ctrl.type = snap.val();
                
                Object.keys(ctrl.type.fields).forEach(function(key) {
                    var field = db.child("fields/" + ctrl.type.fields[key]);
                    
                    field.on("value", function(snap) {
                        ctrl.fields[field.key()] = snap.val();
                        
                        m.redraw();
                    });
                });

                m.redraw();
            });
            
            m.redraw();
        });
        
        ctrl.namechange = name.set.bind(name);
    },

    view : function(ctrl) {
        console.log(ctrl);
        
        if(!ctrl.entry || !ctrl.type || !Object.keys(ctrl.fields).length) {
            return m("h1", "Loading...");
        }
        
        return [
            m("h1", "Content - Editing \"" + ctrl.entry.name + "\""),
            
            m("div",
                m("label",
                    "Name:",
                    m("input", { value : ctrl.entry.name, oninput : m.withAttr("value", ctrl.namechange) })
                )
            ),
            
            m("hr"),
            
            Object.keys(ctrl.fields).map(function(key) {
                var field = ctrl.fields[key];
                
                // TODO: Send along actual refs here
                return m.component(fields[field.type].display, {
                    field : key,
                    data  : db.child()
                });
            })
        ];
    }
};
