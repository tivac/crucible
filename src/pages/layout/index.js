"use strict";

var m = require("mithril"),
    
    db = require("../../lib/firebase.js"),
    
    css = require("./layout.css");

function upgrade(el, init) {
    if(init) {
        return;
    }
    
    componentHandler.upgradeElement(el);
}

function link(schema) {
    return m("a", { class : "mdl-navigation__link", href : "/content/" + schema.key }, schema.name)
}

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
        return m(".mdl-layout.mdl-js-layout.mdl-layout--fixed-header", { config : upgrade },
            m("header.mdl-layout__header",
                m(".mdl-layout__header-row",
                    m("span.mdl-layout-title", options.title || "Title"),
                    m(".mdl-layout-spacer"),
                    m("nav.mdl-navigation.mdl-layout--large-screen-only",
                        m("a", { class : "mdl-navigation__link", href : "/" }, "Home"),
                        ctrl.schemas.map(link),
                        m("button.mdl-button.mdl-button--icon", { onclick : ctrl.add },
                            m("i.material-icons", "add")
                        )
                    )
                )
            ),
            m(".mdl-layout__drawer",
                m("span.mdl-layout-title", options.title || "Title"),
                m("nav.mdl-navigation",
                    m("a", { class : "mdl-navigation__link", href : "/" }, "Home"),
                    ctrl.schemas.map(link),
                    m("button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect", { onclick : ctrl.add },
                        m("i.material-icons", "add"),
                        "Add Schema"
                    )
                )
            ),
            m("main.mdl-layout__content",
                options.content ?
                    m("div", { class : css.content }, options.content) :
                    m("div", { class : css.progress })
            )
        );
    }
}
