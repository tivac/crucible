import m from "mithril";
import get from "lodash.get";
import assign from "lodash.assign";
import isUndefined from "lodash.isundefined";

import input from "./lib/input.js";
import checkIsHidden from "./lib/hide.js";
import addClasses from "./lib/classer.js";

import css from "./lib/types.css";


/**
 *
 */

// Bound below
var types;


function became(field, is) {
    var show = field.show,
        valid = show && !isUndefined(show.prevHidden) && !isUndefined(show.hidden);

    if(!valid) {
        return false;
    }

    return (is === "hidden") ?
        !show.prevHidden && show.hidden :
        show.prevHidden && !show.hidden;
}

function becameHidden(field) {
    return became(field, "hidden");
}

function becameShown(field) {
    return became(field, "shown");
}


export function view(ctrl, options) {
    var fields = options.fields || [],
        mFields = [],
        component,
        field,
        i,
        hidden,
        result,
        hidIndex;

   // options.hidden = [];

    // mFields = fields.map((field, index) => {
    for(i = 0; i < fields.length; i++) {
        field = fields[i];
        component = types[field.type || field];

        field = checkIsHidden(options.state, field);

        if(becameHidden(field)) {
            options.setHidden(field.key, true);
        } else if(becameShown(field)) {
            options.setHidden(field.key, false);
        }
        
        // debugger;

        if(!component) {
            return m("div",
                m("p", "Unknown component"),
                m("pre", JSON.stringify(field, null, 4))
            );
        }

        result = m.component(component, assign({}, options, {
            field : field,
            data  : get(options.data, field.key),
            path  : options.path.concat(field.key),

            hidden : hidden,
            class  : addClasses(field, css[i ? "field" : "first"] )
        }));

        mFields.push(result);
    }

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
