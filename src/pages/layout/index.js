"use strict";

var m = require("mithril"),

    db = require("../../lib/firebase"),

    css = require("./layout.css");

module.exports = {
    controller : function() {
        var ctrl   = this;

        ctrl.hidden = false;
        ctrl.schemas = null;
        ctrl.auth    = db.getAuth();

        ctrl.add = function() {
            m.route("/schema/new");
        };

        ctrl.hide = function() {
            ctrl.hidden = !ctrl.hidden;
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

        return m("div", { class : css.outer },

            m("header", { class : css.header },
                options.content ? null : m("div", { class : css.progress }),

                m("h1", { class : css.heading },
                    m("a", { href : "/", config : m.route }, "Crucible")
                ),

                ctrl.auth ? [
                    m("div", { class : css.schemas },
                        (ctrl.schemas || []).map(function(schema) {
                            var url = "/content/" + schema.key;

                            return m("a", {
                                class  : css[route === url ? "active" : "schema"],
                                href   : url,
                                config : m.route
                            }, schema.name);
                        })
                    ),

                    m("a", {
                        class  : css.add,
                        href   : "/content/new",
                        config : m.route
                    }, "New Schema")
                ] : null,

                m("a", {
                    class  : css.logout,
                    href   : "/logout",
                    config : m.route
                }, "Logout")
            ),

            options.nav ? m("nav", {
                    class : ctrl.hidden ? css.navHidden : css.nav
                },
                m("div", {
                        class   : css.hide,
                        onclick : ctrl.hide
                    },
                    m("span", ctrl.hidden ? "show" : "hide")
                ),

                ctrl.hidden ? null : options.nav
            ) : null,

            m("section", { class : ctrl.hidden || !options.nav ? css.sectionHidden : css.section }, options.content ? options.content : null)
        );
    }
};
