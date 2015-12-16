"use strict";

var m      = require("mithril"),
    get    = require("lodash.get"),
    assign = require("lodash.assign"),

    input = require("./_input"),

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
    // Structural
    fieldset : require("./fieldset"),
    repeating : require("./repeating"),
    split : require("./split"),
    tabs : require("./tabs"),

    // Non-input fields
    instructions : require("./instructions"),
    relationship : require("./relationship"),
    select       : require("./select"),
    
    // These are all just variations on the input type
    date     : input("date"),
    datetime : input("datetime-local"),
    email    : input("email"),
    number   : input("number"),
    text     : input("text"),
    time     : input("time"),
    url      : input("url")
};
