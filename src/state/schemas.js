"use strict";

var assign = require("lodash.assign"),
    
    create = require("./_create-action");

exports.reducer = function(state, action) {
    var changes, field;
    
    if(state === undefined) {
        return {
            id   : {},
            name : {}
        };
    }
    
    // TODO: implement
};

exports.actions = {
};
