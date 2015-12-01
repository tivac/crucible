"use strict";

module.exports = [
    "text",
    "number",
    "select",
    "tabs"
];

module.exports.defaults = {
    text : require("./text-defaults")
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
    }
};
