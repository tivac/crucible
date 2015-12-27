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
        var route = m.route();
        
        return m("div",
            m("div", { class : css.header },
                m("h1", { class : css.heading },
                    m("a", { href : "/" }, "Crucible")
                ),
                m("ul", { class : css.items },
                    ctrl.schemas.map(function(schema) {
                        var url = "/content/" + schema.key;
                        
                        return m("li", { class : css[route === url ? "selected" : "item"] },
                            m("a", { class : css.link, href : url }, schema.name)
                        );
                    })
                )
            ),
            m("div", { class : (options.content ? "" : css.progress) }, options.content || "")
        );
    }
}
