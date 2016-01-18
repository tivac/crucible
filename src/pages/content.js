"use strict";

var m = require("mithril"),

    db = require("../lib/firebase"),

    layout   = require("./layout"),
    listings = require("./content/listings"),
    nav      = require("./content/nav"),
    css      = require("./content.css");

module.exports = {
    controller : function() {
        var ctrl = this,
            schema = db.child("schemas/" + m.route.param("schema"));

        schema.on("value", function(snap) {
            ctrl.schema = snap.val();

            ctrl.schema.key = snap.key();

            m.redraw();
        });

        // Event handlers
        ctrl.add = function() {
            var result;

            result = db.child("content/" + ctrl.schema.key).push({
                name    : "New " + ctrl.schema.name,
                created : db.TIMESTAMP
            });

            m.route("/content/" + ctrl.schema.key + "/" + result.key());
        };
    },

    view : function(ctrl) {
        if(!ctrl.schema) {
            return m.component(layout);
        }

        return m.component(layout, {
            title : ctrl.schema.name,

            nav : m.component(nav, { schema : ctrl.schema }),

            content : [
                m(".head", { class : css.metas },
                    m("div", { class : css.addMeta },
                        m("button", {
                                class   : css.add,
                                onclick : ctrl.add
                            },
                            "Add " + ctrl.schema.name
                        )
                    ),
                    m("div", { class : css.editMeta },
                        m("a", {
                                class  : css.edit,
                                href   : m.route() + "/edit",
                                config : m.route
                            },
                            "Edit Content Type"
                        )
                    )
                ),
                m(".body", { class : css.body },
                    m.component(listings, { schema : ctrl.schema })
                )
            ]
        });
    }
};
