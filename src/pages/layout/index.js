"use strict";

var m = require("mithril"),

    config = require("../../config"),
    
    db     = require("../../lib/firebase"),
    auth   = require("../../lib/valid-auth"),
    prefix = require("../../lib/prefix"),

    layout   = require("./layout.css"),
    header   = require("./header.css"),
    progress = require("./progress.css");

module.exports = {
    // exporting so others can use it more easily
    css : layout,
    
    controller : function() {
        var ctrl   = this;

        ctrl.schemas = null;
        ctrl.auth = auth();

        ctrl.add = function() {
            m.route(prefix("/content/new"));
        };

        db.child("schemas").on("value", function(snap) {
            ctrl.schemas = [];

            snap.forEach(function(schema) {
                var val = schema.val();

                val.key = schema.key();

                ctrl.schemas.push(val);
            });

            m.redraw();
        });
    },

    view : function(ctrl, options) {
        var current = m.route(),
            locked  = config.locked;

        if(!options) {
            options = false;
        }

        document.title = options.title || "Loading...";

        return m("div", { class : layout.container },
            options.content ? null : m("div", { class : progress.bar }),

            m("div", { class : header.container },

                m("div", { class : header.head },
                    m("a", {
                            class  : header.heading,
                            href   : prefix("/"),
                            config : m.route
                        },
                        m("h1", "Anthracite")
                    )
                ),

                m("div", { class : header.body },
                    ctrl.auth ? [
                        m("div", { class : header.schemas },
                            (ctrl.schemas || []).map(function(schema) {
                                var url = prefix("/content/" + schema.key);

                                return m("a", {
                                        class  : header[current.indexOf(url) === 0 ? "active" : "schema"],
                                        href   : url,
                                        config : m.route
                                    },
                                    schema.name
                                );
                            })
                        ),

                        m("button", {
                            // Attrs
                            class    : header.add,
                            disabled : locked || null,
                            
                            // Events
                            onclick : ctrl.add
                        }, "New Schema"),
                        
                        m("a", {
                            class  : header.logout,
                            href   : prefix("/logout"),
                            config : m.route
                        }, "Logout")
                    ] :
                    null
                )
            ),
            options.content ? options.content : null
        );
    }
};
