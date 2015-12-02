"use strict";

var m = require("mithril"),

    fields = require("./");

module.exports = {
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("label", details.name + ": ",
            m("select", details.attrs,
                Object.keys(details.options || {}).map(function(key) {
                    return m.component(fields.components.option.show, {
                        details : details.options[key]
                    });
                })
            )
        );
    }
};
