"use strict";

var m = require("mithril"),
    
    db = require("../lib/firebase"),

    nav      = require("./nav"),
    listings = require("./content/listings");

module.exports = {
    controller : function() {
        var ctrl = this;
        
        ctrl.schemas = [];

        db.child("schemas").on("value", function(snap) {
            snap.forEach(function(schema) {
                ctrl.schemas.push({
                    key  : schema.key(),
                    name : schema.val().name
                });
            });

            m.redraw();
        });
    },

    view : function(ctrl) {
        return m("div",
            m.component(nav),
            m("h1", "CONTENT"),
            ctrl.schemas.map(function(schema) {
                return m.component(listings, { schema : schema });
            })
        );
    }
};
