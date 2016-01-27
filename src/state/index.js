"use strict";

var redux  = require("redux"),
    thunk  = require("redux-thunk"),
    assign = require("lodash.assign"),
    
    ui = require("./ui"),
    
    store;

// This looks bonkers
store = redux.applyMiddleware(thunk)(redux.createStore)(redux.combineReducers({
    ui : ui.reducer
}));

exports.store = store;
exports.actions = assign({}, ui.actions);

// State Object
/*
{
    schemas : {
        id : {
            <schema-id> : <schema-details>
        },
        name : {
            <schema-name> : <schema-id>
        }
    },
    
    items : {
        id : {
            <item-id> : <item-details>
        },
        schema : {
            <schema-name> : [ <item-ids>, ... ]
        }
    }
}
*/
