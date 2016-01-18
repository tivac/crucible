"use strict";

var m  = require("mithril"),

    db   = require("../lib/firebase"),

    layout = require("./layout"),
    css    = require("./layout/layout.css");

module.exports = {
    view : function() {
        return m.component(layout, {
            title   : "Home",
            content : m(".body", { class : css.body },
                m("ul",
                    m("li",
                        m("a", { href : "/schemas", config : m.route }, "Schemas")
                    ),
                    m("li",
                        m("a", { href : "/content", config : m.route }, "Content")
                    )
                )
            )
        });
    }
};
