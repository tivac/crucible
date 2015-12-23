"use strict";

var m  = require("mithril"),
    
    db   = require("../lib/firebase"),
    
    nav = require("./nav");

module.exports = {
    view : function() {
        return m("div",
            m.component(nav),
            m("h1", "HOME"),
            m("ul",
                m("li",
                    m("a", { href : "/schemas", config : m.route }, "Schemas")
                ),
                m("li",
                    m("a", { href : "/content", config : m.route }, "Content")
                )
            )
        );
    }
};
