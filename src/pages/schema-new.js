"use strict";

var m      = require("mithril"),
    sluggo = require("sluggo"),

    db = require("../lib/firebase"),

    layout = require("./layout"),
    css    = require("./schema-edit.css");

module.exports = {
    controller : function() {
        var ctrl  = this;

        ctrl.name = "";
        ctrl.slug = false;

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

            m.route("/content/" + ctrl.slug + "/edit");
        };
    },

    view : function(ctrl) {
        return m.component(layout, {
            title   : "Create a Schema",
            content : m(".body", { class : css.body },
                m("form", { onsubmit : ctrl.onsubmit },
                    m("input[name=name]", {
                        oninput : m.withAttr("value", ctrl.oninput),
                        value   : ctrl.name
                    }),
                    m("p",
                        "Slug: " + (ctrl.slug || "???")
                    ),
                    m("input[type=submit]", { value : "Add" })
                )
            )
        });
    }
};
