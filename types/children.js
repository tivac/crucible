"use strict";

var m      = require("mithril"),
    get    = require("lodash.get"),
    assign = require("lodash.assign"),

    // Bound below
    types;

module.exports = {
    view : function(ctrl, options) {
        var details = options.details || [];

        return m("div", { class : options.class || null },
            details.map(function(field, index) {
                var component = types[field.type || field],
                    data, ref;
                
                if(!component) {
                    return m("div",
                        m("p", "Unknown component"),
                        m("pre", JSON.stringify(field, null, 4))
                    );
                }
                
                if(component.decorative) {
                    data = options.data;
                    ref  = options.ref && options.ref;
                } else {
                    data = get(options, "data." + field.slug);
                    ref  = options.ref && options.ref.child(field.slug);
                }
                
                return m.component(component, assign({}, options, {
                    details : field,
                    index   : index,
                    data    : data,
                    ref     : ref
                }));
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
    text : require("./text"),
    datetime : require("./datetime"),
    date : require("./date"),
    time : require("./time"),
    split : require("./split"),
    relationship : require("./relationship")
};
