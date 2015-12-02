"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    types  = require("../types"),
    db     = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl = this,
            id   = m.route.param("id"),
            
            ref = db.child("schemas/" + id);
        
        ctrl.id     = id;
        ctrl.ref    = ref;
        ctrl.schema = null;
        ctrl.edit   = null;
        ctrl.recent = null;

        ref.on("value", function(snap) {
            ctrl.schema = snap.val();
            
            m.redraw();
        });

        // get 5 latest entries using this type to display
        db.child("content").orderByChild("type").equalTo(id).limitToLast(5).on("value", function(snap) {
            ctrl.recent = snap.val();

            m.redraw();
        });
    },

    view : function(ctrl) {
        if(!ctrl.schema) {
            return m("h1", "Loading...");
        }
        
        return [
            m("h1", ctrl.schema.name),
            m("h2", "Recent Entries"),
            m("ul",
                Object.keys(ctrl.recent || {}).map(function(key) {
                    return m("li",
                        m("a", { href : "/content/" + key, config : m.route }, ctrl.recent[key].name)
                    );
                })
            ),
            m.component(types.components.fields.edit, {
                details : ctrl.schema,
                root    : ctrl.ref,
                ref     : ctrl.ref
            })
        ];
    }
};
