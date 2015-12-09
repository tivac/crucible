"use strict";

var m = require("mithril");

module.exports = {
    view : function(ctrl) {
        return [
            m("h1", "CRUCIBLE SETUP"),
            
            m("ol",
                m("li", "Copy config-example.js to config.js"),
                m("li", "Edit config.js to add your firebase URL"),
                m("li", m("button", {
                    onclick : function(e) {
                        window.location = "/";
                    }
                }, "I've done that"))
            )
        ];
    }
};
