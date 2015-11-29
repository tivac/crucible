"use strict";

var m = require("mithril"),
    
    db = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl    = this,
            content = db.child("content");
        
        ctrl.content = null;
        
        content.on("value", function(snap) {
            ctrl.content = snap.val() || {};
            
            m.redraw();
        });
    },

    view : function(ctrl) {
        if(!ctrl.content) {
            return m("h1", "LOADING...");
        }
        
        return [
            m("h1", "CONTENT"),
            m("p",
                m("a", { href : "/content/new", config : m.route }, "Add Content")
            ),
            m("ul",
                Object.keys(ctrl.content).map(function(id) {
                    return m("li",
                        m("a", { href : "/content/" + id, config : m.route }, ctrl.content[id].name)
                    );
                })
            )
        ];
    }
};
