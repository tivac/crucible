"use strict";

var m = require("mithril");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("div",
            m("strong", details.name),
            m("p", details.body)
        );
    }
};
