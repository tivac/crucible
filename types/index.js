"use strict";

module.exports = [
    "text",
    "number",
    "select",
    "tabs",
    "repeating"
];

module.exports.defaults = {
    text   : require("./text-defaults"),
    number : require("./number-defaults"),
    tabs   : require("./tabs-defaults")
};

module.exports.components = {
    "text" : {
        edit : require("./text-edit"),
        show : require("./text-show")
    },
    
    "select" : {
        edit : require("./select-edit"),
        show : require("./select-show")
    },
    
    "number" : {
        edit : require("./number-edit"),
        show : require("./number-show")
    },

    "tabs" : {
        edit : require("./tabs-edit"),
        show : require("./tabs-show")
    },

    "fields" : {
        edit : require("./fields-edit"),
        show : require("./fields-show")
    },

    "repeating" : {
        edit : require("./repeating-edit"),
        show : require("./repeating-show")
    }
};
