"use strict";

module.exports = {
    "loading" : require("./loading"),

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
    }
};
