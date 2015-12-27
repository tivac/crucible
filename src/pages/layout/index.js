"use strict";

var m = require("mithril"),
    
    db = require("../../lib/firebase"),
    
    css = require("./layout.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.schemas = [];
        
        ctrl.add = function() {
            m.route("/schema/new");
        };
        
        db.child("schemas").on("value", function(snap) {
            snap.forEach(function(schema) {
                var val = schema.val();
                
                val.key = schema.key();
                
                ctrl.schemas.push(val);
            });
            
            m.redraw();
        });
    },
    
    view : function(ctrl, options) {
        return m("div",
            m("h1", options.title || "Title"),
            m("ul",
                m("li",
                    m("a", { class : "mdl-navigation__link", href : "/" }, "Home")
                ),
                ctrl.schemas.map(function(schema) {
                    return m("li",
                        m("a", { class : "mdl-navigation__link", href : "/content/" + schema.key }, schema.name)
                    );
                }),
                m("li",
                    m("button", { onclick : ctrl.add }, "Add")
                )
            ),
            options.content ?
                m("div", { class : css.content }, options.content) :
                m("div", { class : css.progress })
        );
    }
}
