"use strict";

var assign = require("lodash.assign");

module.exports = function(state, action) {
    var changes;
    
    if(state === undefined) {
        return {
            schema : false,
            item   : false,
            search : false
        };
    }
    
    switch(action.type) {
        case "schema": {
            changes = { schema : action.value };
            break;
        }
        
        case "item": {
            changes = { item : action.value };
            break;
        }
        
        case "search": {
            changes = { search : action.value };
            break;
        }
    }
    
    if(changes) {
        return assign({}, state, changes);
    }
    
    return state;
};
