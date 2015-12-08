"use strict";

var m   = require("mithril"),
    get = require("lodash.get"),

    // Bound below
    types;

module.exports = {
    view : function(ctrl, options) {
        var details = options.details || [];

        return m("div", { class : options.class || null },
            details.map(function(field, idx) {
                var component = types[field.type || field];
                
                if(!component) {
                    return m("div",
                        m("p", "Unknown component"),
                        m("pre", JSON.stringify(field, null, 4))
                    );
                }

                return m.component(component, {
                    details : field,
                    index   : idx,
                    data    : get(options, "data." + idx),
                    ref     : options.ref && options.ref.child(idx),
                });
            })
        );
    }
};

// Have to bind these down here to avoid circular binding issues
types = {
    tabs : require("./tabs"),
    select : require("./select"),
    repeating : require("./repeating"),
    number : require("./number"),
    fieldset : require("./fieldset"),
    instructions : require("./instructions"),
    text : require("./text")
};
