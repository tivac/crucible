"use strict";

var m = require("mithril");

module.exports = {
    view : function() {
        return [
            m("h1", "Anthracite Setup"),
            
            m("ol",
                m("li", "Copy config-example.js to config.js"),
                m("li", "Edit config.js to add your firebase URL"),
                m("li", m("button", {
                    onclick : function() {
                        window.location = "/";
                    }
                }, "I've done that"))
            )
        ];
    }
};
