import m from "mithril";
import get from "lodash.get";
import assign from "lodash.assign";

import input from "./lib/input.js";
import checkIsHidden from "./lib/hide.js";

import css from "./lib/types.css";

// Bound below
var types,
    hiddenEl = m("div", { class : "hidden", "data-hidden": "true" });

export function view(ctrl, options) {
    var fields = options.fields || [],
        mFields;

    mFields = fields.map((field, index) => {
        var component = types[field.type || field],
            hidden;

        hidden = checkIsHidden(options.state, field);

        if(!component) {
            return m("div",
                m("p", "Unknown component"),
                m("pre", JSON.stringify(field, null, 4))
            );
        }

        // if(hidden) {
        //     return hiddenEl;
        // }

        return m.component(component, assign({}, options, {
            field : field,
            class : css[index ? "field" : "first"],
            data  : get(options.data, field.key),
            path  : options.path.concat(field.key),

            "data-hidden" : "true"
        }));
    });

    return m("div", options.class ? { class : options.class } : null,
        mFields
    );
}

// Structural
import * as fieldset from "./fieldset.js";
import * as repeating from "./repeating.js";
import * as split from "./split.js";
import * as tabs from "./tabs.js";

// Non-input fields
import * as instructions from "./instructions.js";

// Custom input types
import * as relationship from "./relationship.js";
import * as markdown from "./markdown.js";
import * as textarea from "./textarea.js";
import * as upload from "./upload.js";

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
