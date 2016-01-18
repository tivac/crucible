"use strict";

var m = require("mithril"),

    db = require("../../lib/firebase"),

    layout = require("./layout.css"),
    nav    = require("./nav.css");

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

            m("div", { class : layout.header },

                m("div", { class : nav.head },
                    m("a", {
                            class  : nav.heading,
                            href   : "/",
                            config : m.route
                        },
                        m("h1", "Crucible")
                    )
                ),

                m("div", { class : nav.body },
                    ctrl.auth ? [
                        m("div", { class : nav.schemas },
                            (ctrl.schemas || []).map(function(schema) {
                                var url = "/content/" + schema.key;
                                
                                return m("div", { class : nav[route.indexOf(url) === 0 ? "active" : "schema"] },
                                    m("a", {
                                        class  : nav.link,
                                        href   : url,
                                        config : m.route
                                    }, schema.name),
                                    
                                    m("a", {
                                            class  : nav.edit,
                                            title  : "Edit Schema",
                                            href   : url + "/edit",
                                            config : m.route
                                        },
                                        m("svg", { class : nav.editIcon },
                                            m("use", { href : "/src/icons.svg#icon-edit" })
                                        )
                                    )
                                );
                            })
                        ),

                        m("a", {
                            class  : nav.add,
                            href   : "/content/new",
                            config : m.route
                        }, "New Schema")
                    ] : null,

                    m("a", {
                        class  : nav.logout,
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
