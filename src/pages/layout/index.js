"use strict";

var m = require("mithril"),

    db = require("../../lib/firebase"),

    layout   = require("./layout.css"),
    header   = require("./header.css"),
    progress = require("./progress.css");

module.exports = {
    // exporting so others can use it more easily
    css : layout,
    
    controller : function() {
        var ctrl   = this;

        ctrl.schemas = null;
        ctrl.auth = db.getAuth();

        ctrl.add = function() {
            m.route("/schema/new");
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
        var route = m.route();

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
                            href   : "/",
                            config : m.route
                        },
                        m("h1", "Crucible")
                    )
                ),

                m("div", { class : header.body },
                    ctrl.auth ? [
                        m("div", { class : header.schemas },
                            (ctrl.schemas || []).map(function(schema) {
                                var url = "/content/" + schema.key;

                                return m("div", { class : header[route.indexOf(url) === 0 ? "active" : "schema"] },
                                    m("a", {
                                        class  : header.link,
                                        href   : url,
                                        config : m.route
                                    }, schema.name)
                                );
                            })
                        ),

                        m("a", {
                            class  : header.add,
                            href   : "/content/new",
                            config : m.route
                        }, "New Schema")
                    ] :
                    null,

                    m("a", {
                        class  : header.logout,
                        href   : "/logout",
                        config : m.route
                    }, "Logout")
                )
            ),
            options.content ? options.content : null
        );
    }
};
