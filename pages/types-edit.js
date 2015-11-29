"use strict";

var m = require("mithril"),

    fields = require("../fields"),
    db     = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl = this,
            id   = m.route.param("id"),
            
            type   = db.child("types/" + id),
            fields = db.child("fields");
        
        ctrl.id     = id;
        ctrl.type   = null;
        ctrl.edit   = null;
        ctrl.recent = {};

        type.on("value", function(snap) {
            ctrl.type = snap.val();

            m.redraw();
        });
        
        // get 5 latest entries using this type to display
        db.child("content").orderByChild("type").equalTo(id).limitToLast(5).on("value", function(snap) {
            ctrl.recent = snap.val() ;
            
            m.redraw();
        });
        
        ctrl.add = function(field, e) {
            var result;
            
            e.preventDefault();

            // Create the field & start editing it
            result = type.child("fields").push({
                type : field,
                name : field
            });
            
            ctrl.edit = result.key();
            
            type.child("updated").set(db.TIMESTAMP);
        };

        ctrl.editing = function(key, e) {
            e.preventDefault();

            ctrl.edit = key;
        };
        
        ctrl.remove = function(key, e) {
            e.preventDefault();
            
            type.child("fields").child(key).remove();
            
            type.child("updated").set(db.TIMESTAMP);
        };
    },

    view : function(ctrl) {
        if(!ctrl.type) {
            return m("h1", "Loading...");
        }
        
        return [
            m("h1", "Editing " + ctrl.type.name),
            m("form",
                m("strong", "Add a field"),
                Object.keys(fields).map(function(type) {
                    if(type === "Loading") {
                        return null;
                    }

                    return m("a[href=/types/new/add-field]", { onclick : ctrl.add.bind(ctrl, type) }, type);
                }),
                m("hr"),
                Object.keys(ctrl.type.fields || {}).map(function(key) {
                    var ref   = db.child("types/" + ctrl.id + "/fields/" + key),
                        field = ctrl.type.fields[key];
                    
                    if(ctrl.edit !== key) {
                        return m("div", { onclick : ctrl.editing.bind(ctrl, key) },
                            m.component(fields[field.type].show, { field : ref })
                        );
                    }

                    return m("div",
                        m.component(fields[field.type].show, { field : ref }),
                        m.component(fields[field.type].edit, { field : ref }),
                        m("button", { onclick : ctrl.remove.bind(ctrl, key) }, "Remove")
                    );
                })
            ),
            m("hr"),
            m("h2", "Recent Entries"),
            m("ul",
                Object.keys(ctrl.recent || {}).map(function(key) {
                    return m("li",
                        m("a", { href : "/content/" + key, config : m.route }, ctrl.recent[key].name)
                    );
                })
            )
        ];
    }
};
