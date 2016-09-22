import m from "mithril";
import get from "lodash.get";
import assign from "lodash.assign";

import input from "./lib/input.js";
import checkHidden from "./lib/hide.js";
import addClasses from "./lib/classer.js";

import css from "./lib/types.css";

// Bound below
var types;

export function view(vnode) {
    var fields = vnode.attrs.fields || [],
        registerHidden = vnode.attrs.registerHidden,
        mFields = [];

    mFields = fields.map(function(field, index) {
        var component,
            wasHidden,
            isHidden,
            result;

        component = types[field.type || field];

        if(!component) {
            return m("div",
                m("p", "Unknown component"),
                m("pre", JSON.stringify(field, null, 4))
            );
        }

        if(field.show) {
            wasHidden = field.show.hidden;
            field.show.hidden = checkHidden(vnode.attrs.state, field);

            if(registerHidden && field.show.hidden !== wasHidden) {
                // hidden status changed, notify the controller.
                registerHidden(field.key, field.show.hidden);
                m.redraw();
            }
        }

        isHidden = get(field, "show.hidden");

        result = m(component, assign({}, vnode.attrs, {
            field : field,
            class : addClasses(field, css[index ? "field" : "first"]),
            data  : get(vnode.attrs.data, field.key),
            path  : vnode.attrs.path.concat(field.key),

            required : !isHidden && field.required
        }));


        return result;
    });

    return m("div", vnode.attrs.class ? { class : vnode.attrs.class } : null,
        mFields
    );
}

// Structural
import fieldset from "./fieldset.js";
import repeating from "./repeating.js";
import split from "./split.js";
import tabs from "./tabs.js";

// Non-input fields
import instructions from "./instructions.js";

// Custom input types
import relationship from "./relationship.js";
import markdown from "./markdown.js";
import textarea from "./textarea.js";
import upload from "./upload.js";

// Implementations based on lib/multiple.js
import select from "./select.js";
import radio from "./radio.js";
import checkbox from "./checkbox.js";

// Have to bind these down here to avoid circular binding issues
types = {
    // Structural
    fieldset  : fieldset,
    repeating : repeating,
    split     : split,
    tabs      : tabs,

    // Non-input fields
    instructions : instructions,
    
    // Custom input types
    relationship : relationship,
    markdown     : markdown,
    textarea     : textarea,
    upload       : upload,
    
    // Implementations based on lib/multiple.js
    select   : select,
    radio    : radio,
    checkbox : checkbox,

    // Implementations based on lib/input.js
    date     : input("date"),
    datetime : input("datetime-local"),
    email    : input("email"),
    number   : input("number"),
    text     : input("text"),
    time     : input("time"),
    url      : input("url")
};
