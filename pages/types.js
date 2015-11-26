"use strict";

var m = require("mithril"),
    
    db = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl  = this,
            types = db.child("types");
        
        ctrl.types = null;
        
        types.on("value", function(snap) {
            ctrl.types = snap.val();
            
            m.redraw();
        });
    },

    view : function(ctrl) {
        if(!ctrl.types) {
            return m("LOADING");
        }
        
        return [
            m("h1", "TYPES"),
            m("ul",
                Object.keys(ctrl.types).map(function(id) {
                    return m("li",
                        m("a", { href : "/types/" + id, config : m.route }, ctrl.types[id].name)
                    );
                })
            )
        ];
    }
};
