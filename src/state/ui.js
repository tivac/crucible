"use strict";

var assign = require("lodash.assign"),
    
    create = require("./_create-action");

exports.reducer = function(state, action) {
    var changes, field;
    
    if(state === undefined) {
        return {
            schema : false,
            item   : false,
            search : false
        };
    }
    
    if(action.type.indexOf("ui-") !== 0) {
        return state;
    }
    
    changes = {};
    field = action.type.split("-")[1];
    
    changes[field] = action.payload;
    
    return assign({}, state, changes);
};

exports.actions = {
    uiSchema : create("ui-schema"),
    uiItem   : create("ui-item"),
    uiSearch : create("ui-search")
};
