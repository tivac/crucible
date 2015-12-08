"use strict";

var m  = require("mithril"),
    db = require("../lib/firebase");

module.exports = {
    controller : function() {

    },

    view : function() {
        return [
            m("h1", "HOME"),
            m("ul",
                m("li",
                    m("a", { href : "/schemas", config : m.route }, "Schemas")
                ),
                m("li",
                    m("a", { href : "/content", config : m.route }, "Content")
                )
            )
        ]
    }
};
