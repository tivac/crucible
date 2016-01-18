"use strict";

var m = require("mithril"),

    db = require("../../lib/firebase"),

    layout = require("./layout.css"),
    header = require("./header.css");

module.exports = {
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

        return m(".outer", { class : layout.outer },
            options.content ? null : m("div", { class : layout.progress }),

            m(".header", { class : layout.header },

                m(".head", { class : header.head },
                    m("a", {
                            class  : header.heading,
                            href   : "/",
                            config : m.route
                        },
                        m("h1", "Crucible")
                    )
                ),

                m(".body", { class : header.body },
                    ctrl.auth ? [
                        m(".schemas", { class : header.schemas },
                            (ctrl.schemas || []).map(function(schema) {
                                var url = "/content/" + schema.key;

                                return m("a", {
                                    class  : header[route === url ? "active" : "schema"],
                                    href   : url,
                                    config : m.route
                                }, schema.name);
                            })
                        ),

                        m("a", {
                            class  : header.add,
                            href   : "/content/new",
                            config : m.route
                        }, "New Schema")
                    ] : null,

                    m("a", {
                        class  : header.logout,
                        href   : "/logout",
                        config : m.route
                    }, "Logout")
                )
            ),

            options.nav ? options.nav : null,

            m(".content", { class : layout.content },
                options.content ? options.content : null
            )
        );
    }
};
