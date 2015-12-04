"use strict";

module.exports = [
    "text",
    "number",
    "select",
    "tabs",
    "repeating",
    "instructions"
];

module.exports.defaults = {
    text : {
        name  : "Text Field",
        attrs : {
            placeholder : "Enter some text, not too much"
        }
    },
    number : {
        name  : "Number Field",
        attrs : {
            placeholder : "Numbers!"
        }
    },
    tabs : {
        name  : "Tabs"
    },
    select : {
        name  : "select",
        attrs : {
            size : 1
        }
    }
};

module.exports.components = {
    "fields"       : require("./fields"),
    "instructions" : require("./instructions"),
    "number"       : require("./number"),
    "option"       : require("./option"),
    "repeating"    : require("./repeating"),
    "select"       : require("./select"),
    "tabs"         : require("./tabs"),
    "text"         : require("./text")
};
