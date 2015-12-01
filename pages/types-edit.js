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
        ctrl.fields = null;
        ctrl.recent = null;

        type.on("value", function(snap) {
            ctrl.type = snap.val();

            m.redraw();
        });

        // get fields for this type
        fields.orderByChild("type").equalTo(id).on("value", function(snap) {
            ctrl.fields = snap.val();

            m.redraw();
        });
        
        // get 5 latest entries using this type to display
        db.child("content").orderByChild("type").equalTo(id).limitToLast(5).on("value", function(snap) {
            ctrl.recent = snap.val() ;
            
            m.redraw();
        });

        ctrl.add = function(field, e) {
            var update = {},
                key, result;
            
            e.preventDefault();

            // Create the field & start editing it
            result = fields.push({
                field   : field,
                name    : field,
                type    : ctrl.id,
                updated : db.TIMESTAMP
            });
            
            key = result.key();

            update[key] = true;

            type.child("fields").update(update);
            type.child("updated").set(db.TIMESTAMP);

            ctrl.edit = key;
            
        };

        ctrl.editing = function(key, e) {
            e.preventDefault();

            ctrl.edit = key;
        };
        
        ctrl.remove = function(key, e) {
            e.preventDefault();
            
            fields.child(key)
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

                    if(ctrl.edit !== key) {
                        return m("div", { onclick : ctrl.editing.bind(ctrl, key) },
                            m.component(fields.components[field.field].show, { field : field })
                        );
                    }

                    return m("div",
                        m.component(fields.components[field.field].show, { field : field }),
                        m.component(fields.components[field.field].edit, { ref : db.child("fields/" + key), field : field }),
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
