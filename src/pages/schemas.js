"use strict";

var m = require("mithril"),
    
    db = require("../lib/firebase"),
    
    nav = require("./nav");

module.exports = {
    controller : function() {
        var ctrl = this;
        
        db.child("schemas").on("value", function(snap) {
            ctrl.schemas = snap.val();
            
            m.redraw();
        });
    },

    view : function(ctrl) {
        return [
            m(nav),
            m("h1", "Schemas"),
            m("p",
                m("a[href=/schemas/new]", { config : m.route }, "Create a new Schema")
            ),
            m("h2", "Current Schemas"),
            m("ul",
                Object.keys(ctrl.schemas || {}).map(function(id) {
                    return m("li",
                        m("a", { href : "/schemas/" + id, config : m.route }, ctrl.schemas[id].name)
                    );
                })
            )
        ];
    }
};
