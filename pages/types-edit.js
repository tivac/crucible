"use strict";

var m = require("mithril"),

    fields = require("../fields"),
    db     = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl = this,
            type, fields;

        ctrl.id     = m.route.param("id");
        ctrl.type   = null;
        ctrl.fields = {};
        ctrl.edit   = null;

        type   = db.child("types/" + ctrl.id);
        fields = db.child("fields");

        type.on("value", function(snap) {
            ctrl.type = snap.val();

            m.redraw();
        });

        type.child("fields").on("child_added", function(snap) {
            var id = snap.val();

            fields.child(id).on("value", function(snap) {
                ctrl.fields[id]    = snap.val();
                ctrl.fields[id].id = id;

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
            id = fields.push({
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
    },

    view : function(ctrl) {
        if(!ctrl.type) {
            return m("h1", "Loading...");
        }

        return [
            m("h1", "Editing " + ctrl.type.name),
            m("form",
                Object.keys(fields).map(function(type) {
                    if(type === "Loading") {
                        return null;
                    }

                    return m("a[href=/types/new/add-field]", { onclick : ctrl.add.bind(ctrl, type) }, type);
                }),
                m("hr"),
                Object.keys(ctrl.type.fields || {}).map(function(ref) {
                    var id    = ctrl.type.fields[ref],
                        field = ctrl.fields[id];

                    if(!field) {
                        return m("div", { key : "loading-" + id },
                            "Loading..."
                        );
                    }

                    if(ctrl.edit !== id) {
                        return m("div", {
                                key : "display-" + id,
                                onclick : ctrl.editing.bind(ctrl, id)
                            },
                            m.component(fields[field.type].display, field)
                        );
                    }

                    return m("div", { key : "edit-" + id },
                        m.component(fields[field.type].edit, field)
                    );
                })
            )
        ];
    }
};
