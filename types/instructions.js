"use strict";

var m = require("mithril");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("div",
            details.head ? m("p", m("strong", details.head)) : null,
            details.body ? m("p", details.body) : null
        );
    }
};
