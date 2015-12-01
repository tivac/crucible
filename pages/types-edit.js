"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    fields = require("../fields"),
    db     = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl = this,
            id   = m.route.param("id"),
            
            typeRef   = db.child("types/" + id),
            fieldsRef = db.child("fields");
        
        ctrl.id     = id;
        ctrl.type   = null;
        ctrl.edit   = null;
        ctrl.fields = null;
        ctrl.recent = null;

        typeRef.on("value", function(snap) {
            ctrl.type = snap.val();

            m.redraw();
        });

        // get fields for this type
        fieldsRef.orderByChild("type").equalTo(id).on("value", function(snap) {
            ctrl.fields = snap.val();
            
            // Removed redraw here because it screws up editing cursor position
            // Unsure if that's a safe move, but seems ok for now?
        });
        
        // get 5 latest entries using this type to display
        db.child("content").orderByChild("type").equalTo(id).limitToLast(5).on("value", function(snap) {
            ctrl.recent = snap.val();
            
            m.redraw();
        });

        ctrl.add = function(field, e) {
            var update = {},
                key, result;
            
            e.preventDefault();

            // Create the field & start editing it
            result = fieldsRef.push(assign({}, fields.defaults[field], {
                field   : field,
                type    : ctrl.id,
                updated : db.TIMESTAMP
            }));
            
            key = result.key();

            update[key] = true;

            typeRef.child("fields").update(update);
            typeRef.child("updated").set(db.TIMESTAMP);
            
            ctrl.edit = key;
        };

        ctrl.editing = function(key, e) {
            e.preventDefault();

            ctrl.edit = key;
        };
        
        ctrl.remove = function(key, e) {
            e.preventDefault();
            
            fieldsRef.child(key)
            typeRef.child("fields").child(key).remove();
            
            typeRef.child("updated").set(db.TIMESTAMP);
        };
    },

    view : function(ctrl) {
        if(!ctrl.type) {
            return m("h1", "Loading...");
        }
        
        return [
            m("h1", "Editing " + ctrl.type.name),
            m("form",
                m("strong", "Add a field: "),
                fields.map(function(field) {
                    return m("span",
                        m("a[href=/types/new/add-field]", { onclick : ctrl.add.bind(ctrl, field) }, field),
                        " | "
                    );
                }),
                m("hr"),
                Object.keys(ctrl.type.fields || {}).map(function(key) {
                    var field = ctrl.fields && ctrl.fields[key];
                    
                    if(!field) {
                        return null;
                    }
                    
                    // Firebase won't populate an empty object, so make sure this exists
                    if(!field.attrs) {
                        field.attrs = {};
                    }

                    if(key !== ctrl.edit) {
                        return m("div", { key : "show-" + key, onclick : ctrl.editing.bind(ctrl, key) },
                            m.component(fields.components[field.field].show, { field : field })
                        );
                    }
                    
                    return m("div", { key : "edit-" + key },
                        m.component(fields.components[field.field].show, { field : field }),
                        m.component(fields.components[field.field].edit, { field : field, ref : db.child("fields/" + key) }),
                        
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
