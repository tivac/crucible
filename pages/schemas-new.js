"use strict";

var m      = require("mithril"),
    sluggo = require("sluggo"),

    db = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl  = this;

        ctrl.name = "";
        ctrl.slug = "";

        ctrl.oninput = function(name) {
            ctrl.name = name;
            ctrl.slug = sluggo(name);
        };

        ctrl.onsubmit = function(e) {
            e.preventDefault();

            db.child("schemas/" + ctrl.slug).set({
                name    : ctrl.name,
                created : db.TIMESTAMP,
                updated : db.TIMESTAMP
            });

            m.route("/schemas/" + ctrl.slug);
        };
    },

    view : function(ctrl) {
        return [
            m("h1", "Add a Type"),
            m("form", { onsubmit : ctrl.onsubmit },
                m("input[name=name]", {
                    oninput : m.withAttr("value", ctrl.oninput),
                    value   : ctrl.name
                }),
                m("p",
                    "Slug: " + ctrl.slug
                ),
                m("input[type=submit]", { value : "Add" })
            )
        ];
    }
};
