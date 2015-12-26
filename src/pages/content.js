"use strict";

var m = require("mithril"),
    
    db = require("../lib/firebase"),
    
    layout   = require("./layout"),
    listings = require("./content/listings");

module.exports = {
    controller : function() {
        var ctrl = this,
            schema = m.route.param("schema");
        
        db.child("schemas/" + schema).on("value", function(snap) {
            ctrl.schema = snap.val();
            
            ctrl.schema.key = snap.key();
            
            m.redraw();
        });
    },

    view : function(ctrl) {
        if(!ctrl.schema) {
            return m.component(layout, {
                title   : "",
                content : "Loading..."
            });
        }
        
        return m.component(layout, {
            title : ctrl.schema.name,
            content : m("div",
                m("p",
                    m("a", { href : "/schema/" + ctrl.schema.key }, "Edit " + ctrl.schema.name)
                ),
                m.component(listings, { schema : ctrl.schema })
            )
        });
    }
};
