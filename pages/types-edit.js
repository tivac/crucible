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

        ctrl.type   = null;
        ctrl.edit   = null;
        ctrl.fields = {};

        type.on("value", function(snap) {
            ctrl.type = snap.val();

            m.redraw();
        });

        type.child("fields").on("child_added", function(snap) {
            var id = snap.val();

            fields.child(id).on("value", function(snap) {
                ctrl.fields[id] = snap.val();

                m.redraw();
            });
        });

        type.child("fields").on("child_removed", function(snap) {
            delete ctrl.fields[snap.val()];
            
            m.redraw();
        });
        
        ctrl.add = function(field, e) {
            var id;

            e.preventDefault();

            // Create the field
            id = db.child("fields").push({
                type : field,
                name : field
            });

            // Track that this type is watching that field
            type.child("fields").push(id.key());
        };

        ctrl.editing = function(id, e) {
            e.preventDefault();

            ctrl.edit = id;
        };
        
        ctrl.remove = function(id, e) {
            e.preventDefault();
            
            fields.child(ctrl.type.fields[id]).remove();
            type.child("fields").child(id).remove();
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
                    var id    = ctrl.type.fields[key],
                        field = ctrl.fields[id],
                        ref   = db.child("fields/" + id);
                    
                    if(!field) {
                        return null;
                    }
                    
                    if(ctrl.edit !== id) {
                        return m("div", { onclick : ctrl.editing.bind(ctrl, id) },
                            m.component(fields[field.type].display, { field : ref })
                        );
                    }

                    return m("div",
                        m.component(fields[field.type].display, { field : ref }),
                        m.component(fields[field.type].edit, { field : ref }),
                        m("button", { onclick : ctrl.remove.bind(ctrl, key) }, "Remove")
                    );
                })
            )
        ];
    }
};
