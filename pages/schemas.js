"use strict";

var m = require("mithril"),
    
    db = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl  = this,
            schemas = db.child("schemas");
        
        ctrl.schemas = null;
        
        schemas.on("value", function(snap) {
            ctrl.schemas = snap.val();
            
            m.redraw();
        });
    },

    view : function(ctrl) {
        if(!ctrl.schemas) {
            return m("LOADING");
        }
        
        return [
            m("h1", "schemas"),
            m("ul",
                Object.keys(ctrl.schemas).map(function(id) {
                    return m("li",
                        m("a", { href : "/schemas/" + id, config : m.route }, ctrl.schemas[id].name)
                    );
                })
            )
        ];
    }
};
