"use strict";

var m = require("mithril"),

    db = require("../../lib/firebase"),

    css = require("./layout.css");

module.exports = {
    controller : function() {
        var ctrl = this;

        ctrl.schemas = null;
        ctrl.auth    = db.getAuth();

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

        return m("div", { class : css.outer },
            m("header", { class : css.header },
                m("h1", { class : css.heading },
                    m("a", { href : "/", config : m.route }, "Crucible")
                ),
                options.content ? null : m("div", { class : css.progress })
            ),
            m("section", { class : css.section },
                m("nav",
                    { class : css.nav },
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
                    ] : null
                ),
                m("article", { class : css.article }, options.content ? options.content : null)
            )
        );
    }
};
